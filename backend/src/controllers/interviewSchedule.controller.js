// backend/controllers/interviewSchedule.controller.js
import InterviewSchedule from '../models/InterviewSchedule.js';
import Session from '../models/Session.js';
import { streamClient, chatClient } from '../lib/stream.js';

export const getInterviewByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await InterviewSchedule.findOne({ roomId });

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.status === 'cancelled') return res.status(400).json({ message: "Interview cancelled" });
    if (interview.status === 'completed') return res.status(400).json({ message: "Interview already completed" });

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const joinScheduledInterview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user; // from Clerk middleware

    const interview = await InterviewSchedule.findOne({ roomId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // Basic time & status checks
    if (interview.status !== 'scheduled') {
      return res.status(400).json({ message: "This interview is no longer active" });
    }

    const now = new Date();
    const fifteenMinBefore = new Date(interview.scheduledTime.getTime() - 15 * 60 * 1000);
    if (now < fifteenMinBefore) {
      return res.status(400).json({ message: "Room opens 15 minutes before start time" });
    }

    // Role detection
    const isInterviewer = interview.interviewerId === user.clerkId;
    const isCandidate = interview.candidateEmail.toLowerCase() === user.email.toLowerCase();

    if (!isInterviewer && !isCandidate) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find or create Session + Stream resources
    let session = await Session.findOne({ callId: roomId });

    if (!session) {
      // Only interviewer can create the room
      if (!isInterviewer) {
        return res.status(400).json({ message: "Wait for interviewer to join first" });
      }

      session = await Session.create({
        problem: `Mock Interview – ${interview.interviewType}`,
        difficulty: "medium",
        host: user._id,
        hostClerkId: interview.interviewerId,
        callId: roomId,
        status: "active"
      });

      // Create Stream Video Call
      await streamClient.video.call("default", roomId).getOrCreate({
        data: {
          created_by_id: interview.interviewerId,
          custom: { type: "scheduled-interview", interviewId: interview._id.toString() }
        }
      });

      // Create Chat Channel
      const channel = chatClient.channel("messaging", roomId, {
        name: `${interview.candidateName} × ${interview.interviewerName}`,
        created_by_id: interview.interviewerId,
        members: [interview.interviewerId]
      });
      await channel.create();
    } else {
      // Candidate joining as candidate
      if (isCandidate && !session.participant) {
        session.participant = user._id;
        await session.save();

        // Add candidate to chat
        const channel = chatClient.channel("messaging", roomId);
        await channel.addMembers([user.clerkId]);
      }
    }

    res.json({
      success: true,
      session,
      interview,
      role: isInterviewer ? 'interviewer' : 'candidate'
    });

  } catch (error) {
    console.error("joinScheduledInterview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const completeScheduledInterview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    const interview = await InterviewSchedule.findOne({ roomId });
    if (!interview) return res.status(404).json({ message: "Not found" });

    if (interview.interviewerId !== user.clerkId) {
      return res.status(403).json({ message: "Only interviewer can end the call" });
    }

    interview.status = 'completed';
    await interview.save();

    const session = await Session.findOne({ callId: roomId });
    if (session) {
      session.status = 'completed';
      await session.save();

      // Optional: clean up Stream resources
      try {
        await streamClient.video.call("default", roomId).delete({ hard: true });
        const channel = chatClient.channel("messaging", roomId);
        await channel.delete();
      } catch (e) { /* ignore */ }
    }

    res.json({ success: true, message: "Interview completed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};