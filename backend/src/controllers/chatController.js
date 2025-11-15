import { chatClient, generateVideoToken } from "../lib/stream.js";
import { requireAuth } from "@clerk/express";

export async function getStreamToken(req, res) {
  try {
    const { userId } = req.body;  // From frontend sessionApi.getStreamToken
    if (!userId) return res.status(400).json({ message: "userId required" });

    // Generate tokens using chatClient (it handles both video and chat)
    const token = chatClient.createToken(userId);  // Works for both video & chat
    const chatToken = chatClient.createToken(userId);  // Same token is fine

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

export async function upsertUser(req, res) {
  try {
    const { id, name, image } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    await chatClient.upsertUser({
      id,
      name: name || "Anonymous",
      image: image || "",
    });
    
    console.log(`Stream user upserted: ${id} - ${name}`);
    res.status(200).json({ message: "User upserted successfully" });
  } catch (error) {
    console.error("Error upserting user:", error);
    res.status(500).json({ message: "Failed to upsert user" });
  }
}