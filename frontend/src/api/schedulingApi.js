// frontend/src/api/schedulingApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  // Skip token for Clerk requests
  if (config.url?.includes('/clerk.') || config.url?.includes('clerk.com')) {
    return config;
  }

  try {
    // Get token from Clerk
    let token = null;
    
    if (window.Clerk?.session) {
      token = await window.Clerk.session.getToken();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request:', config.url);
    } else {
      console.warn('⚠️ No token available for:', config.url);
    }
  } catch (error) {
    console.error('❌ Token error:', error);
  }

  return config;
});

export const schedulingApi = {
  // Get available slots
  getAvailableSlots: async (interviewerId, startDate, endDate, timezone = 'UTC') => {
    try {
      const response = await api.get(`/api/interview-schedule/available-slots/${interviewerId}`, {
        params: { startDate, endDate, timezone }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error.response?.data || error;
    }
  },

  // Book interview
  bookInterview: async (bookingData) => {
    try {
      const response = await api.post('/api/interview-schedule/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking interview:', error);
      throw error.response?.data || error;
    }
  },

  // Get my interviews
  getMyInterviews: async (role = 'candidate', status = null, upcoming = false) => {
    try {
      const response = await api.get('/api/interview-schedule/my-interviews', {
        params: { role, status, upcoming }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error.response?.data || error;
    }
  },

  // Cancel interview
  cancelInterview: async (id, reason = '') => {
    try {
      const response = await api.delete(`/api/interview-schedule/${id}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error.response?.data || error;
    }
  },

  // Set availability
  setAvailability: async (availabilityData) => {
    try {
      const response = await api.post('/api/interview-schedule/availability', availabilityData);
      return response.data;
    } catch (error) {
      console.error('Error setting availability:', error);
      throw error.response?.data || error;
    }
  },

  // Get availability
  getAvailability: async (interviewerId) => {
    try {
      const response = await api.get(`/api/interview-schedule/availability/${interviewerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error.response?.data || error;
    }
  },

  // Delete availability
  deleteAvailability: async (id) => {
    try {
      const response = await api.delete(`/api/interview-schedule/availability/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw error.response?.data || error;
    }
  },

  // Get interviewers list
  getInterviewers: async () => {
    try {
      const response = await api.get('/api/interview-schedule/interviewers');
      return response.data;
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      throw error.response?.data || error;
    }
  },

  // Join interview room (for scheduled interviews)
  joinRoom: async (roomId) => {
    try {
      const response = await api.post(`/api/interview-schedule/room/${roomId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error.response?.data || error;
    }
  },

  // Complete interview
  completeInterview: async (roomId) => {
    try {
      const response = await api.post(`/api/interview-schedule/room/${roomId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing interview:', error);
      throw error.response?.data || error;
    }
  },

  // Get interview by room ID
  getInterviewByRoomId: async (roomId) => {
    try {
      const response = await api.get(`/api/interview-schedule/room/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw error.response?.data || error;
    }
  },
};

export default schedulingApi;
