import { Router } from "express";
import {
  trackView,
  trackSearch,
  trackPurchase,
  getSuggestions,
  getTrending,
} from "../controllers/trackingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes (work for both guests and logged-in users)
router.post("/view", trackView);
router.post("/search", trackSearch);
router.post("/purchase", trackPurchase);
router.get("/suggestions", getSuggestions);
router.get("/trending", getTrending);

export default router;
