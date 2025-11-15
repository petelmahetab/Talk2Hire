import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

// Chat client (server-side)
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// Video token generation (server-side)
export const generateVideoToken = (userId, callId) => {
  try {
    // Create a token for video calls
    return chatClient.createToken(userId);
  } catch (error) {
    console.error("Error generating video token:", error);
    throw error;
  }
};

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};