
import axiosInstance from "../lib/axios";

const getAuthHeaders = async () => {
  try {
    // Get the token from Clerk
    const token = await window.Clerk?.session?.getToken();
    
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    
    return {};
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {};
  }
};

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },
getActiveSessions: async () => {
    const headers = await getAuthHeaders();
    const response = await axiosInstance.get("/sessions/active", { headers });
    return response.data;
  },
  
  getMyRecentSessions: async () => {
    const headers = await getAuthHeaders();
    const response = await axiosInstance.get("/sessions/my-recent", { headers });
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