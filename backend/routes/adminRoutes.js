import express from "express";
import {
  createBook,
  updateBook,
  deleteBook,
  getAllBooksAdmin,
  getBookAdminById,
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
 *   get:
 *     summary: Get all books (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (title, author, description)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (string or categoryId depending on your schema)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: "Sort field (e.g., price, -price, -createdAt)"
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 120
 *                     pages:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 */
router.get("/books", protect, admin, getAllBooksAdmin);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   get:
 *     summary: Get a single book by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access only
 *       404:
 *         description: Book not found
 */
router.get("/books/:id", protect, admin, getBookAdminById);

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - description
 *               - category
 *               - price
 *               - image
 *               - pdf
 *             properties:
 *               title:
 *                 type: string
 *                 example: Clean Code
 *               author:
 *                 type: string
 *                 example: Robert C. Martin
 *               description:
 *                 type: string
 *                 example: A handbook of agile software craftsmanship
 *               category:
 *                 type: string
 *                 example: Programming
 *               price:
 *                 type: number
 *                 example: 150
 *               image:
 *                 type: string
 *                 format: binary
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Book created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Book'
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
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *               pdf:
 *                 type: string
 *                 format: binary
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
 *     summary: Disable a book (soft delete) (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book disabled successfully
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (name or email)
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
 *         description: User ID
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
