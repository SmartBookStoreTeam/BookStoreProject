import express from "express";
import { getAuthorDashboard } from "../controllers/authorDashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Author dashboard — only accessible by role "author"
router.get("/", protect, authorize("author"), getAuthorDashboard);

export default router;
