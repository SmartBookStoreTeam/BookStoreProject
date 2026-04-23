import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { getMyLibrary, updateReadingProgress } from "../controllers/libraryController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-library", protect, getMyLibrary);
router.put("/my-library/:bookId/progress", protect, updateReadingProgress);

export default router;
