// frontend/src/lib/axios.js
import axios from "axios";

console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Request interceptor - log what we're sending
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("📤 Axios Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - log what we receive
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("📥 Axios Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
