import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitApplication,
  getMyApplication,
} from "../controllers/authorApplicationController.js";

const router = express.Router();

// All routes require login
router.use(protect);

// POST   /api/author-applications      → submit application (JSON body with base64 signature)
// GET    /api/author-applications/my   → get my application status

router.post("/", submitApplication);
router.get("/my", getMyApplication);

export default router;