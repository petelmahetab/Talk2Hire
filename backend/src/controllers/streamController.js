import { chatClient } from "../lib/stream.js";
import { ENV } from "../lib/env.js";

export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth();   // Clerk (new) API
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (!ENV.STREAM_API_KEY || !ENV.STREAM_API_SECRET || ENV.STREAM_API_SECRET.trim() === '') {
      return res.status(500).json({ error: "Missing or invalid Stream API configuration" });
    }
    
    console.log('API Secret loaded:', !!ENV.STREAM_API_SECRET ? 'YES' : 'NO (EMPTY)');
    
    // Use chatClient to create token (works for both video and chat)
    const token = chatClient.createToken(userId);

    return res.json({ token });
  } catch (error) {
    console.error("STREAM TOKEN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};