import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Express backend
});

// Attach token automatically
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.authToken) {
      config.headers.Authorization = `Bearer ${session.authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
