import express from "express";
import {
  submitBook,
  getMyBooks,
  editMyBook,
  deleteMyBook,
  getMyBookContract,
  previewContractPDF,
} from "../controllers/authorBookController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadBookFiles } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication + author role
router.use(protect, authorize("author"));

router.post("/books", uploadBookFiles, submitBook);
router.post("/books/preview-contract", previewContractPDF);
router.get("/books", getMyBooks);
router.get("/books/:id/contract", getMyBookContract);
router.put("/books/:id", uploadBookFiles, editMyBook);
router.delete("/books/:id", deleteMyBook);

export default router;
