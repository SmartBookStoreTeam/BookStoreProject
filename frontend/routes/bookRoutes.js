import express from "express";
import {
  getBooks,
  getBookById,
  searchBooks,
  getTopBooks,
} from "../controllers/bookController.js";

const router = express.Router();

// GET all books
router.get("/", getBooks);

// GET a single book by ID
router.get("/:id", getBookById);

// GET top rated books
router.get("/top", getTopBooks);

// GET search books by title or author
router.get("/search", searchBooks);

export default router;
