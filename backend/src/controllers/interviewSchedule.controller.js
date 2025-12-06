import InterviewSchedule from '../models/InterviewSchedule.js';
import Session from '../models/Session.js';
import { streamClient, chatClient } from '../lib/stream.js';

export const getInterviewByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await InterviewSchedule.findOne({ roomId });

    if (!interview) {
      return res.status(404).json({ 
        success: false,
        message: "Interview not found" 
      });
    }
    
    if (interview.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: "Interview cancelled" 
      });
    }
    
    if (interview.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: "Interview already completed" 
      });
    }

    res.json({ success: true, interview });
  } catch (error) {
    console.error("getInterviewByRoomId error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const joinScheduledInterview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    console.log('🔍 Join attempt:', { 
      roomId, 
      userEmail: user.email, 
      clerkId: user.clerkId 
    });

    const interview = await InterviewSchedule.findOne({ roomId });
    
    if (!interview) {
      return res.status(404).json({ 
        success: false,
        message: "Interview room not found" 
      });
    }

    // Status check
    if (interview.status !== 'scheduled') {
      return res.status(400).json({ 
        success: false,
        message: `This interview is ${interview.status}` 
      });
    }

    // Time check (15 minutes before)
    const now = new Date();
    const scheduledTime = new Date(interview.scheduledTime);
    const fifteenMinBefore = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
    
    if (now < fifteenMinBefore) {
      const minutesUntil = Math.ceil((fifteenMinBefore - now) / 60000);
      return res.status(403).json({
        success: false,
        message: `Room opens 15 minutes before start time (in ${minutesUntil} minutes)`
      });
    }

    // Role detection
    const isInterviewer = interview.interviewerId === user.clerkId;
    const isCandidate = interview.candidateEmail.toLowerCase() === user.email.toLowerCase();

    console.log('👤 Role check:', { isInterviewer, isCandidate });

    if (!isInterviewer && !isCandidate) {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to join this interview" 
      });
    }

    // Find or create session
    let session = await Session.findOne({ callId: roomId });

    if (!session) {
      // Only interviewer can create room
      if (!isInterviewer) {
        return res.status(400).json({ 
          success: false,
          message: "Please wait for the interviewer to join first" 
        });
      }

      console.log('🏗️ Creating new session for room:', roomId);

      // FIXED: Create session with proper data
      session = await Session.create({
        problem: null, // Will be selected by interviewer in UI
        difficulty: "medium",
        host: user._id,
        hostClerkId: interview.interviewerId,
        callId: roomId,
        status: "active"
      });

      // Create Stream Video Call
      try {
        await streamClient.video.call("default", roomId).getOrCreate({
          data: {
            created_by_id: interview.interviewerId,
            custom: { 
              type: "scheduled-interview", 
              interviewId: interview._id.toString(),
              interviewType: interview.interviewType
            }
          }
        });
        console.log('✅ Stream video call created');
      } catch (streamError) {
        console.error('❌ Stream video error:', streamError);
      }

      // Create Chat Channel
      try {
        const channel = chatClient.channel("messaging", roomId, {
          name: `${interview.candidateName} × ${interview.interviewerName}`,
          created_by_id: interview.interviewerId,
          members: [interview.interviewerId]
        });
        await channel.create();
        console.log('✅ Chat channel created');
      } catch (chatError) {
        console.error('❌ Chat channel error:', chatError);
      }

    } else {
      // Candidate joining existing session
      if (isCandidate && !session.participant) {
        session.participant = user._id;
        await session.save();

        // Add candidate to chat
        try {
          const channel = chatClient.channel("messaging", roomId);
          await channel.addMembers([user.clerkId]);
          console.log('✅ Candidate added to chat');
        } catch (chatError) {
          console.error('❌ Add member error:', chatError);
        }
      }
    }

    res.json({
      success: true,
      session,
      interview,
      role: isInterviewer ? 'interviewer' : 'candidate'
    });

  } catch (error) {
    console.error("❌ joinScheduledInterview error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

export const completeScheduledInterview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    const interview = await InterviewSchedule.findOne({ roomId });
    
    if (!interview) {
      return res.status(404).json({ 
        success: false,
        message: "Interview not found" 
      });
    }

    if (interview.interviewerId !== user.clerkId) {
      return res.status(403).json({ 
        success: false,
        message: "Only the interviewer can end the interview" 
      });
    }

    interview.status = 'completed';
    await interview.save();

    const session = await Session.findOne({ callId: roomId });
    if (session) {
      session.status = 'completed';
      await session.save();

      // Clean up Stream resources
      try {
        await streamClient.video.call("default", roomId).delete({ hard: true });
        const channel = chatClient.channel("messaging", roomId);
        await channel.delete();
        console.log('✅ Stream resources cleaned up');
      } catch (e) {
        console.error('❌ Cleanup error:', e);
      }
    }

    res.json({ 
      success: true, 
      message: "Interview completed successfully" 
    });
    
  } catch (error) {
    console.error("completeScheduledInterview error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};
