import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('clerk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const schedulingApi = {
  
  getAvailableSlots: async (interviewerId, startDate, endDate, timezone = 'UTC') => {
    try {
      const response = await api.get(`/scheduling/available-slots/${interviewerId}`, {
        params: { startDate, endDate, timezone }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error.response?.data || error;
    }
  },

  bookInterview: async (bookingData) => {
    try {
      const response = await api.post('/scheduling/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking interview:', error);
      throw error.response?.data || error;
    }
  },

  getMyInterviews: async (role = 'candidate', status = null, upcoming = false) => {
    try {
      const response = await api.get('/scheduling/my-interviews', {
        params: { role, status, upcoming }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error.response?.data || error;
    }
  },

  getInterview: async (id) => {
    try {
      const response = await api.get(`/scheduling/interview/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw error.response?.data || error;
    }
  },

  cancelInterview: async (id, reason = '') => {
    try {
      const response = await api.delete(`/scheduling/${id}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error.response?.data || error;
    }
  },

  setAvailability: async (availabilityData) => {
    try {
      const response = await api.post('/scheduling/availability', availabilityData);
      return response.data;
    } catch (error) {
      console.error('Error setting availability:', error);
      throw error.response?.data || error;
    }
  },

  getAvailability: async (interviewerId) => {
    try {
      const response = await api.get(`/scheduling/availability/${interviewerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error.response?.data || error;
    }
  },

  deleteAvailability: async (id) => {
    try {
      const response = await api.delete(`/scheduling/availability/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw error.response?.data || error;
    }
  },

  updateInterviewStatus: async (id, status, feedback = null, rating = null) => {
    try {
      const response = await api.patch(`/scheduling/${id}/status`, {
        status,
        feedback,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Error updating interview status:', error);
      throw error.response?.data || error;
    }
  }
};

export default schedulingApi;