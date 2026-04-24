import { Router } from "express";
import {
  trackView,
  trackSearch,
  trackPurchase,
  getSuggestions,
  getTrending,
} from "../controllers/trackingController.js";

const router = Router();

// All public - no protect middleware needed (works for guests + logged in)
router.post("/view", trackView);
router.post("/search", trackSearch);
router.post("/purchase", trackPurchase);
router.get("/suggestions", getSuggestions);
router.get("/trending", getTrending);

export default router;
