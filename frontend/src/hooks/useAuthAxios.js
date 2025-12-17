// frontend/src/hooks/useAuthAxios.js
import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";
import axiosInstance from "../lib/axios";

/**
 * Custom hook that returns axios instance with automatic auth token injection
 */
export const useAuthAxios = () => {
  const { getToken } = useAuth();

  const makeRequest = useCallback(
    async (method, url, data = null, config = {}) => {
      try {
        const token = await getToken();
        
        const requestConfig = {
          ...config,
          headers: {
            ...config.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };

        console.log("🔐 Making authenticated request:", {
          method,
          url,
          hasToken: !!token,
        });

        if (method === "get" || method === "delete") {
          return await axiosInstance[method](url, requestConfig);
        } else {
          return await axiosInstance[method](url, data, requestConfig);
        }
      } catch (error) {
        console.error("❌ Authenticated request failed:", error);
        throw error;
      }
    },
    [getToken]
  );

  return {
    get: (url, config) => makeRequest("get", url, null, config),
    post: (url, data, config) => makeRequest("post", url, data, config),
    put: (url, data, config) => makeRequest("put", url, data, config),
    patch: (url, data, config) => makeRequest("patch", url, data, config),
    delete: (url, config) => makeRequest("delete", url, null, config),
  };
};

export default useAuthAxios;
