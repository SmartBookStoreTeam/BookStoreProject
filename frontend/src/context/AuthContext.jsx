/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from "react";
import api from "../api/api";
import * as authApi from "../api/authApi";

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
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  /* ---------- register ---------- */
  const register = async (name, email, password, extraData = {}) => {
    try {
      await api.post("/auth/register", { name, email, password, ...extraData });
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

  /* ---------- update user ---------- */
  const updateUser = async (name, email) => {
    try {
      const response = await authApi.updateProfile({ name, email });
      if (response.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Update failed",
      };
    }
  };

  /* ---------- refresh user ---------- */
  const refreshUser = async () => {
    try {
      if (logoutInProgress) return { success: false };
      const res = await api.get("/auth/me");
      const currentUser = res.data?.user || res.data;
      if (currentUser && !logoutInProgress) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
        return { success: true, user: currentUser };
      }
      return { success: false };
    } catch (err) {
      console.error("Refresh user failed:", err);
      return { success: false };
    }
  };

  /* ---------- logout ---------- */
  const logout = async () => {
    setLogoutInProgress(true);
    try {
      // Call backend to clear cookie
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Always clear frontend state
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      setLogoutInProgress(false);
    }
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
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- hook ---------- */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
