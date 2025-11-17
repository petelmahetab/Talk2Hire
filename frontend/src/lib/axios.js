import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// ✅ Create axios instance with correct backend URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // ✅ MUST point to backend, NOT frontend
  withCredentials: true,
});

let authHook = null;

// Store auth hook when component mounts
export const setAuthHook = (hook) => {
  authHook = hook;
};

// ✅ Add Clerk token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (authHook) {
        const token = await authHook.getToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Auth token added to request');
        } else {
          console.warn('⚠️ No Clerk token available');
        }
      }
    } catch (error) {
      console.error('❌ Error getting Clerk token:', error.message);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Handle response errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token may be invalid or expired');
    } else if (error.response?.status === 403) {
      console.error('❌ 403 Forbidden - User does not have permission');
    } else if (error.response?.status === 404) {
      console.error('❌ 404 Not Found - Resource not found. URL:', error.config?.url);
    } else {
      console.error('❌ API Error:', error.response?.data?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;