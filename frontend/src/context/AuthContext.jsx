import { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

/* ---------- helpers ---------- */
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Invalid user in localStorage, clearing it");
    localStorage.removeItem("user");
    return null;
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem("token");
  return token || null;
};

/* ---------- provider ---------- */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  /* ---------- register ---------- */
  const register = async (name, email, password) => {
    try {
      await api.post("/auth/register", { name, email, password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed",
      };
    }
  };

  /* ---------- login ---------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      setUser(res.data.user);
      setToken(res.data.token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  };

  /* ---------- google login ---------- */
  const googleLogin = async (googleUser, accessToken) => {
    try {
      const res = await api.post("/auth/google", {
        token: accessToken,
        user: googleUser,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      setUser(res.data.user);
      setToken(res.data.token);

      return { success: true, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Google login failed",
      };
    }
  };

  /* ---------- verify email ---------- */
  const verifyEmail = async (email, code) => {
    try {
      const res = await api.post("/auth/verify-email", { email, code });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      setUser(res.data.user);
      setToken(res.data.token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Verification failed",
      };
    }
  };

  /* ---------- logout ---------- */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        googleLogin,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- hook ---------- */
export const useAuth = () => useContext(AuthContext);
