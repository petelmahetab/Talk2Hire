import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "../lib/env.js";

export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth();   // Clerk (new) API
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // CREATE THE STREAM CLIENT
    const stream = new StreamClient({
      apiKey: ENV.STREAM_API_KEY,
      apiSecret: ENV.STREAM_API_SECRET,
    });

   
    const token = stream.userTokens.create(userId);

    return res.json({ token });
  } catch (error) {
    console.error("STREAM TOKEN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};
