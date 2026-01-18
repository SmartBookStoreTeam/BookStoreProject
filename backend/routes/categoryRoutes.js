import express from "express";
import { getActiveCategories } from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Public categories APIs
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get active categories (Public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/", getActiveCategories);

export default router;
