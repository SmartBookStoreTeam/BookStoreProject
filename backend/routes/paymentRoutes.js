import express from "express";
import {
  createCheckoutSession,
  cancelOrder,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create checkout session
router.post("/checkout", protect, createCheckoutSession);

router.post("/cancel/:orderId", protect, cancelOrder);

export default router;
