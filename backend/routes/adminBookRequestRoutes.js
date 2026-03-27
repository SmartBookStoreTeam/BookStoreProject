import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllBookRequests,
  getBookRequestById,
  reviewBookRequest,
  getBookRequestStats,
} from "../controllers/adminBookRequestController.js";

const router = express.Router();

// All routes require login + admin role
router.use(protect, admin);

// GET    /api/admin/book-requests            → list all with filters
// GET    /api/admin/book-requests/stats      → dashboard stats
// GET    /api/admin/book-requests/:id        → full detail view
// PUT    /api/admin/book-requests/:id/review → approve/reject/revision

router.get("/", getAllBookRequests);
router.get("/stats", getBookRequestStats);
router.get("/:id", getBookRequestById);
router.put("/:id/review", reviewBookRequest);

export default router;
