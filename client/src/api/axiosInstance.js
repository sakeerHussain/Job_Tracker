import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false, // No longer using cookies
});

// Attach token to every request from memory
api.interceptors.request.use((config) => {
  const token = window.__authToken__;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config.url.includes("/auth/me");
    if (error.response?.status === 401 && !isAuthCheck) {
      window.__authToken__ = null;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;