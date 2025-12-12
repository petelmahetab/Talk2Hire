import axios from "axios";
console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL); 
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});

export default axiosInstance;
