import { streamClient, chatClient } from "../lib/stream.js";  // Your lib exports
import { requireAuth } from "@clerk/express";  // Guard for user

export async function getStreamToken(req, res) {
  try {
    const { userId } = req.body;  // From frontend sessionApi.getStreamToken
    if (!userId) return res.status(400).json({ message: "userId required" });

    // Gen tokens (video/chat—same for simplicity; use separate if needed)
    const token = streamClient.createToken(userId);  // Video token
    const chatToken = chatClient.createToken(userId);  // Chat token

    // Pull from Clerk req.user (synced via protectRoute)
    const { name, profileImage } = req.user;  // Real "Mahetab Patel" / avatar URL

    console.log(`Token gen for ${userId}—length: ${token.length}`);  // Debug log

    res.json({ 
      token,  // Video token (use in initializeStreamClient)
      chatToken,  // Chat token (if separate; else use token)
      userId, 
      userName: name, 
      userImage: profileImage 
    });
  } catch (error) {
    console.error("Token error:", error);
    res.status(500).json({ message: "Token failed—check Stream secret" });
  }
}