import express from "express";
import {
  createCheckoutSession,
  paymobWebhook,
  cancelOrder,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyPaymobHmac } from "../middleware/paymobHmac.js";

const router = express.Router();

// Create checkout session — authenticated users only
router.post("/checkout", protect, createCheckoutSession);

// ✅ GET — transaction response callback (sends query params only)
router.get("/webhook", verifyPaymobHmac, paymobWebhook);

// Cancel order
router.post("/cancel/:orderId", protect, cancelOrder);

export default router;
