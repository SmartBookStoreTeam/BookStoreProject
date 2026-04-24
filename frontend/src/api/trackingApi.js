import api from "./api.jsx";

// generate or get a persistent session ID for guest tracking
const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

// attach sessionId to every tracking request
const trackingHeaders = () => ({
  headers: { "x-session-id": getSessionId() },
});

// ── Track a book view ────────────────────────────────────────────────────────
export const trackView = async (bookId) => {
  try {
    await api.post("/tracking/view", { bookId }, trackingHeaders());
  } catch {
    // silent fail — never break the UI
  }
};

// ── Track a search query ─────────────────────────────────────────────────────
export const trackSearch = async (query) => {
  try {
    if (!query || query.trim().length < 2) return;
    await api.post("/tracking/search", { query }, trackingHeaders());
  } catch {
    // silent fail
  }
};

// ── Track a purchase ─────────────────────────────────────────────────────────
export const trackPurchase = async (bookIds) => {
  try {
    await api.post("/tracking/purchase", { bookIds }, trackingHeaders());
  } catch {
    // silent fail
  }
};

// ── Get personalized suggestions ─────────────────────────────────────────────
export const getSuggestions = async (limit = 10) => {
  try {
    const res = await api.get("/tracking/suggestions", {
      params: { limit },
      ...trackingHeaders(),
    });
    return res.data;
  } catch {
    return { success: false, data: [] };
  }
};

// ── Get trending books ───────────────────────────────────────────────────────
export const getTrending = async (limit = 10) => {
  try {
    const res = await api.get("/tracking/trending", {
      params: { limit },
      ...trackingHeaders(),
    });
    return res.data;
  } catch {
    return { success: false, data: [] };
  }
};
