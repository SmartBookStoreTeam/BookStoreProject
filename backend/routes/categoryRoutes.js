import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getActiveCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: APIs for managing book categories
 */

// --- Public Routes ---

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get active categories (Public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", getActiveCategories);

// --- Admin Routes ---

/**
 * @swagger
 * /api/categories/admin:
 *   get:
 *     summary: List categories with pagination (Admin)
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/admin", protect, admin, getAdminCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 */
router.post("/", protect, admin, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category (Admin)
 *     tags: [Categories]
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
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", protect, admin, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Soft delete/Disable category (Admin)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disabled successfully
 */
router.delete("/:id", protect, admin, deleteCategory);

export default router;
