import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 1) حط التوكن لو موجود
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) لو رجع HTML بدل JSON اعتبره خطأ (ده اللي كنا بنتكلم عنه)
api.interceptors.response.use(
  (res) => {
    const ct = res.headers["content-type"] || "";
    if (ct.includes("text/html")) {
      return Promise.reject(
        new Error("API misrouted: got HTML instead of JSON."),
      );
    }
    return res;
  },
  (err) => Promise.reject(err),
);

export default api;
