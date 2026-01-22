import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/authMiddleware.js";
import {
  getAdminOrders,
  approveOrder,
  rejectOrder,
  deleteOrder,
} from "../controllers/adminOrderController.js";

const router = express.Router();

router.get("/", protect, admin, getAdminOrders);
router.patch("/:id/approve", protect, admin, approveOrder);
router.patch("/:id/reject", protect, admin, rejectOrder);
router.delete("/:id", protect, admin, deleteOrder);

export default router;
