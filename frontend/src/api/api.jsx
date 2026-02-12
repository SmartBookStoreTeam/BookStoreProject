import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important: Send cookies with requests
});

// Note: Backend uses HttpOnly cookies for JWT, not Authorization header
// So we don only need to enable withCredentials, no need to add token manually

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
