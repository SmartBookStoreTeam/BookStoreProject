import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requestPurchase } from "../controllers/orderController.js";

const router = express.Router();

router.post("/request", protect, requestPurchase);

export default router;
