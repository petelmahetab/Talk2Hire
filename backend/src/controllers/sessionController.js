import { chatClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import PendingJoin from "../models/PendingJoin.js"; 
import { clerkClient } from "../lib/clerk.js";
import { requireAuth } from "@clerk/express";
import crypto from 'crypto';

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    // REMOVED: Video call creation - handle on frontend with @stream-io/video-react-sdk
    // The frontend will create the call using the token from getStreamToken

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    const joinToken = crypto.randomBytes(32).toString('hex');
    session.joinToken = joinToken;
    await session.save();

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${session._id}?token=${joinToken}`;

    console.log(`Session ${session._id} created by ${clerkId}—share: ${shareLink}`);

    res.status(201).json({ session, shareLink });
  
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const validateJoinLink = [
  async (req, res, next) => {
    const { id, token } = req.params || req.query;
    if (!id) return res.status(400).json({ message: "Session ID required" });
    
    const session = await Session.findById(id);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ message: "Invalid or expired session" });
    }
    
    if (token && session.joinToken !== token) {
      return res.status(403).json({ message: "Invalid join token" });
    }
    
    req.sessionId = id;
    next();
  }
];

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id).populate('participant', 'clerkId');

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // Idempotent check
    if (session.participant && session.participant.clerkId !== clerkId) {
      return res.status(409).json({ message: "Session is full" });
    }
    if (session.participant && session.participant.clerkId === clerkId) {
      console.log(`User ${clerkId} already in session ${id} - skipping add`);
      return res.status(200).json({ session, message: "Already joined" });
    }

    session.participant = userId;
    await session.save();

    // Add to chat
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    console.log(`User ${clerkId} joined session ${id}`);

    res.status(200).json({ 
      session, 
      message: "Joined as candidate—your stream live!" 
    });
  } catch (error) {
    console.error("Error in joinSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // REMOVED: Video call deletion - frontend will handle ending the call
    // Just delete the chat channel

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function requestJoin(req, res) {
  try {
    const { id } = req.params;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);
    if (!session || session.status !== 'active') return res.status(400).json({ message: "Invalid session" });
    if (session.participant) return res.status(409).json({ message: "Room full—try another" });

    const existing = await PendingJoin.findOne({ sessionId: id, requesterClerkId: clerkId, status: 'pending' });
    if (existing) return res.status(200).json({ message: "Request pending—await host approval" });

    const fullClerkUser = await clerkClient.users.getUser(clerkId);
    const pending = await PendingJoin.create({
      sessionId: id,
      requesterClerkId: clerkId,
      requesterName: fullClerkUser.fullName || 'Anonymous',
      requesterEmail: fullClerkUser.emailAddresses[0]?.emailAddress || '',
    });
    session.pendingParticipants.push(pending._id);
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.sendMessage({
      text: `Join request from ${fullClerkUser.fullName} (${fullClerkUser.emailAddresses[0]?.emailAddress})—approve?`,
      type: 'join_request',
      custom: { requesterClerkId: clerkId, pendingId: pending._id },
    });
    
    console.log(`Request from ${clerkId} for session ${id}—sent to channel ${session.callId}`); 
    res.status(201).json({ message: "Request sent—host will approve soon" });
  } catch (error) {
    console.error("requestJoin:", error);
    res.status(500).json({ message: "Request failed" });
  }
} 

export async function approveJoin(req, res) {
  try {
    const { id, pendingId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id).populate('host');
    if (!session || session.host._id.toString() !== userId.toString()) return res.status(403).json({ message: "Only host can approve" });

    const pending = await PendingJoin.findById(pendingId);
    if (!pending || pending.status !== 'pending') return res.status(400).json({ message: "Invalid request" });

    pending.status = 'approved';
    await pending.save();

    const requesterUser = await User.findOne({ clerkId: pending.requesterClerkId }) || await User.create({ clerkId: pending.requesterClerkId, name: pending.requesterName, email: pending.requesterEmail });
    session.participant = requesterUser._id;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([pending.requesterClerkId]);
    await channel.sendMessage({ text: `Approved! Welcome to the room, ${pending.requesterName}!` });

    console.log(`Approved ${pending.requesterClerkId} for session ${id}—added to channel`);
    res.status(200).json({ message: "Approved—candidate joining now" });
  } catch (error) {
    console.error("approveJoin:", error);
    res.status(500).json({ message: "Approval failed" });
  }
}