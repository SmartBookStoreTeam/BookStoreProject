import express from "express";
import { previewBook, streamBook } from "../controllers/previewController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Preview
 *   description: Public preview APIs
 */

/**
 * @swagger
 * /api/books/{id}/preview:
 *   get:
 *     summary: Get a signed URL for book preview (Public)
 *     tags: [Preview]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Preview URL generated successfully
 *       404:
 *         description: Book not found or preview not available
 */
router.get("/books/:id/preview", previewBook);
router.post("/books/:id/pdf-stream", streamBook);

export default router;
