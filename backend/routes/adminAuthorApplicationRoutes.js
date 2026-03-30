import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllApplications,
  getApplicationById,
  reviewApplication,
  getApplicationStats,
} from "../controllers/adminAuthorApplicationController.js";

const router = express.Router();

// All routes require login + admin role
router.use(protect, admin);

// GET    /api/admin/author-applications          → list all with filters
// GET    /api/admin/author-applications/stats    → dashboard stats
// GET    /api/admin/author-applications/:id      → full detail + signature
// PUT    /api/admin/author-applications/:id/review → approve / reject

router.get("/", getAllApplications);
router.get("/stats", getApplicationStats);
router.get("/:id", getApplicationById);
router.put("/:id/review", reviewApplication);

export default router;
