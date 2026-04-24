import { useEffect, useRef } from "react";
import { trackView, trackSearch } from "../api/trackingApi";

// ── useTrackView: call once when a book page mounts ──────────────────────────
export const useTrackView = (bookId) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!bookId || tracked.current) return;
    tracked.current = true;
    trackView(bookId);
  }, [bookId]);
};

// ── useTrackSearch: debounced search tracking ─────────────────────────────────
export const useTrackSearch = (query, delay = 1500) => {
  useEffect(() => {
    if (!query || query.trim().length < 2) return;

    const timer = setTimeout(() => {
      trackSearch(query.trim());
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);
};
