import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) throw new Error("VITE_API_URL is missing");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
