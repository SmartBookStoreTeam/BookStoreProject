import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  verifyEmail,
  deleteMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Profile
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Samy Elsayed
 *               email:
 *                 type: string
 *                 example: samy@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or invalid data
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmed@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - user
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google access token
 *               user:
 *                 type: object
 *                 properties:
 *                   sub:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   picture:
 *                     type: string
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Invalid Google user data
 */
router.post("/google", googleAuth);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: samy@email.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authorized
 *   put:
 *     summary: Update logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Samy Updated
 *               email:
 *                 type: string
 *                 example: samy_new@email.com
 *               avatar:
 *                 type: string
 *                 example: https://example.com/new-avatar.png
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Email already in use
 *   delete:
 *     summary: Delete self account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized
 */
router.put("/me", protect, updateProfile);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authorized, token missing or invalid
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   delete:
 *     summary: Delete self account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized
 */
router.delete("/me", protect, deleteMe);

export default router;
