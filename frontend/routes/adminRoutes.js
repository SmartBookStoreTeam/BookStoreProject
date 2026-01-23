import express from "express";
import {
  createBook,
  updateBook,
  deleteBook,
  getAllUsers,
  deleteUser,
  getAllOrders,
  approveOrder,
  rejectOrder,
} from "../controllers/adminController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------
// Book Management
// -----------------
router.post("/books", protect, admin, createBook);
router.put("/books/:id", protect, admin, updateBook);
router.delete("/books/:id", protect, admin, deleteBook);

// -----------------
// User Management
// -----------------
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);

// -----------------
// Order Management
// -----------------
router.get("/orders", protect, admin, getAllOrders);
router.patch("/orders/:id/approve", protect, admin, approveOrder);
router.patch("/orders/:id/reject", protect, admin, rejectOrder);

export default router;
