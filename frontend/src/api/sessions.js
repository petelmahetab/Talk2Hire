
import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },

  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    // Check if id is a UUID (callId) or MongoDB ObjectId
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    const endpoint = isUUID 
      ? `/sessions/call/${id}`   // Use callId endpoint for mock interviews
      : `/sessions/${id}`;        // Use _id endpoint for regular sessions
    
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  joinSession: async (id) => {
    // Same logic for join - check if UUID or ObjectId
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    const endpoint = isUUID 
      ? `/sessions/call/${id}/join`
      : `/sessions/${id}/join`;
    
    const response = await axiosInstance.post(endpoint);
    return response.data;
  },

  endSession: async (id) => {
    // Same logic for end session
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    const endpoint = isUUID 
      ? `/sessions/call/${id}/end`
      : `/sessions/${id}/end`;
    
    const response = await axiosInstance.post(endpoint);
    return response.data;
  },

  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};