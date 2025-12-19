import express from "express";
import {
  createBook,
  updateBook,
  deleteBook,
  getAllUsers,
  deleteUser,
} from "../controllers/adminController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadBookFiles } from "../middleware/upload.js";

const router = express.Router();

// -----------------
// Book Management
// -----------------
router.post("/books", protect, admin, uploadBookFiles, createBook);
router.put("/books/:id", protect, admin, updateBook);
router.delete("/books/:id", protect, admin, deleteBook);

// -----------------
// User Management
// -----------------
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);

export default router;
