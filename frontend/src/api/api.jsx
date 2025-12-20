import axios from "axios";

const api = axios.create({
  // This tells axios to just append /api to whatever the current domain is
  baseURL: import.meta.env.VITE_API_URL || "/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
