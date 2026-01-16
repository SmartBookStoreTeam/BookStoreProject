import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { downloadBook } from "../controllers/downloadController.js";

const router = express.Router();

router.get("/books/:id/download", protect, downloadBook);

export default router;
