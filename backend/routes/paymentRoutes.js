import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifySession,
  cancelOrder,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⚠️ Stripe webhook MUST receive the raw body — mount BEFORE express.json()
// In server.js, add this BEFORE app.use(express.json()):
//   app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
router.post("/webhook", stripeWebhook);

// Create Stripe Checkout Session — authenticated users only
router.post("/checkout", protect, createCheckoutSession);

// Verify session after Stripe redirect (called from success page)
router.get("/verify", protect, verifySession);

// Cancel a pending order
router.post("/cancel/:orderId", protect, cancelOrder);

export default router;
