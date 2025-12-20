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

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/* =========================
   Book Management (Admin)
   ========================= */

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Clean Code
 *               author:
 *                 type: string
 *                 example: Robert C. Martin
 *               price:
 *                 type: number
 *                 example: 25
 *               rating:
 *                 type: number
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Book created successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 */
router.post("/books", protect, admin, uploadBookFiles, createBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     summary: Update a book (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 *       404:
 *         description: Book not found
 */
router.put("/books/:id", protect, admin, uploadBookFiles, updateBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 *       404:
 *         description: Book not found
 */
router.delete("/books/:id", protect, admin, deleteBook);

/* =========================
   User Management (Admin)
   ========================= */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 */
router.get("/users", protect, admin, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", protect, admin, deleteUser);

export default router;
