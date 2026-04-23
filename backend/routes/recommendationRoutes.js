import { Router } from "express";
const router = Router();
import { getRecommendations, getSimilarBooks } from "../controllers/recommendationController.js";

// GET /api/recommendations?query=...&genre=...&limit=5
router.get("/", getRecommendations);

// GET /api/recommendations/similar/:bookId
router.get("/similar/:bookId", getSimilarBooks);

export default router;
