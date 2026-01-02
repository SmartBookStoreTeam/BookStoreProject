import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n.js";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const applyTheme = () => {
  const theme = localStorage.getItem("theme") || "system";
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (systemPrefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};
applyTheme();

let activeTouchElement = null;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  const el = e.target.closest(".touch-area");
  if (!el) return;

  activeTouchElement = el;
  touchStartY = e.touches[0].clientY;
  el.classList.add("touch-active");
});

// إزالة touch-active لما يحصل scroll
document.addEventListener(
  "touchmove",
  (e) => {
    if (!activeTouchElement) return;

    // لو المستخدم حرك إصبعه أكتر من 10 بكسل، يبقى بيعمل scroll
    const touchMoveY = e.touches[0].clientY;
    const diff = Math.abs(touchMoveY - touchStartY);

    if (diff > 10) {
      activeTouchElement.classList.remove("touch-active");
      activeTouchElement = null;
    }
  },
  { passive: true }
);

const handleTouchEnd = () => {
  if (!activeTouchElement) return;

  const el = activeTouchElement;
  activeTouchElement = null;

  setTimeout(() => {
    el.classList.remove("touch-active");
  }, 120);
};

document.addEventListener("touchend", handleTouchEnd);
document.addEventListener("touchcancel", handleTouchEnd);

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </Router>
  </GoogleOAuthProvider>
);
