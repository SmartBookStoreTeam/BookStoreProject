import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/", protect, addToCart);
router.post("/sync", protect, syncCart);
router.put("/:bookId", protect, updateCartItem);
router.delete("/:bookId", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;
