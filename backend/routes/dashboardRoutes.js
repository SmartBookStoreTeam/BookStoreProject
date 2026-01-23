import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getDashboardStats, getAnalyticsData, getWeeklySales } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", protect, admin, getDashboardStats);
router.get("/analytics", protect, admin, getAnalyticsData);
router.get("/weekly-sales", protect, admin, getWeeklySales);

export default router;
