import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  verifyEmail,
  deleteMe,
  logoutUser,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Profile (Cookie-based JWT)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (sets JWT in HttpOnly cookie)
 *     tags: [Auth]
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth (sets JWT in HttpOnly cookie)
 *     tags: [Auth]
 */
router.post("/google", googleAuth);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email with code
 *     tags: [Auth]
 */
router.post("/verify-email", verifyEmail);

/**
 * ================= User Profile =================
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile (cookie auth)
 *     tags: [Auth]
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update logged-in user profile (cookie auth)
 *     tags: [Auth]
 */
router.put("/me", protect, updateProfile);

/**
 * @swagger
 * /api/auth/me:
 *   delete:
 *     summary: Delete self account
 *     tags: [Auth]
 */
router.delete("/me", protect, deleteMe);

/**
 * ================= Logout =================
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clears JWT cookie)
 *     tags: [Auth]
 */
router.post("/logout",protect, logoutUser);

export default router;
