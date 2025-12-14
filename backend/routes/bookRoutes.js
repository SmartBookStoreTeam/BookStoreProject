import express from "express";
import {
  getBooks,
  getBookById,
  searchBooks,
  getTopBooks,
} from "../controllers/bookController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Books APIs
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get("/", getBooks);

/**
 * @swagger
 * /api/books/top:
 *   get:
 *     summary: Get top rated books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Top books returned
 */
router.get("/top", getTopBooks);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books by title or author
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword (title or author)
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", searchBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book data returned
 *       404:
 *         description: Book not found
 */
router.get("/:id", getBookById);

export default router;
