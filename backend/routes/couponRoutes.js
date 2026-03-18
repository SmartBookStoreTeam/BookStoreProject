import express from "express";
import {
  applyCoupon,
  createCoupon,
  generateCoupon,
  getAllCoupons,
  deleteCoupon,
  toggleCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── User routes ───────────────────────────────────────
// Apply a coupon code (validate before checkout)
router.post("/apply", protect, applyCoupon);

// ─── Admin routes ──────────────────────────────────────
// List all coupons
router.get("/", protect, admin, getAllCoupons);

// Create a coupon manually (admin provides the code)
router.post("/", protect, admin, createCoupon);

// Auto-generate a coupon with a random code
router.post("/generate", protect, admin, generateCoupon);

// Delete a coupon
router.delete("/:id", protect, admin, deleteCoupon);

// Toggle active/inactive
router.patch("/:id/toggle", protect, admin, toggleCoupon);

export default router;
