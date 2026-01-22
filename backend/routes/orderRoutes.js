import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder } from "../controllers/orderController.js";
import { getMyLibrary } from "../controllers/libraryController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-library", protect, getMyLibrary);

export default router;
