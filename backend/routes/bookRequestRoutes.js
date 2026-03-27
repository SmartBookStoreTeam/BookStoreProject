import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadBookFiles, validateBookFiles } from "../middleware/upload.js";
import {
  submitBookRequest,
  getMyBookRequests,
  getBookRequest,
  updateBookRequest,
  deleteBookRequest,
} from "../controllers/bookRequestController.js";

const router = express.Router();

// All routes require login
router.use(protect);

// POST   /api/book-requests          → submit a new request (with files)
// GET    /api/book-requests/my       → list my own requests
// GET    /api/book-requests/:id      → get one of my requests
// PUT    /api/book-requests/:id      → edit a pending/revision request
// DELETE /api/book-requests/:id      → withdraw a pending/rejected request

router.post(
  "/",
  protect,
  authorize("author"),
  uploadBookFiles,
  validateBookFiles,
  submitBookRequest,
);
router.get("/my", protect, authorize("author"), getMyBookRequests);
router.get("/:id", protect, authorize("author"), getBookRequest);
router.put(
  "/:id",
  protect,
  authorize("author"),
  uploadBookFiles,
  updateBookRequest,
);
router.delete("/:id", protect, authorize("author"), deleteBookRequest);

export default router;
