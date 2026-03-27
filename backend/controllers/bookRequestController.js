import asyncHandler from "express-async-handler";
import BookRequest from "../models/BookRequest.js";
import {
  sendBookRequestReceivedEmail,
  sendBookRequestStatusEmail,
} from "../emails/bookRequestEmails.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import cloudinary from "cloudinary";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// ── Helper: upload files attached to the request ───────────────────────────────

const processFiles = async (files, requestId) => {
  const result = {};

  // ✅ Upload both at the same time instead of one by one
  const [imageResult, pdfResult] = await Promise.all([
    files?.image?.[0]
      ? uploadToCloudinary(files.image[0].buffer, {
          folder: "book-store/images",
        })
      : Promise.resolve(null),

    files?.pdf?.[0]
      ? uploadToS3(files.pdf[0].buffer, "book.pdf", files.pdf[0].mimetype, {
          folder: "book-requests",
          subfolder: requestId || "temp",
        })
      : Promise.resolve(null),
  ]);

  if (imageResult) {
    result.coverImage = {
      url: imageResult.secure_url,
      publicId: imageResult.public_id,
    };
  }

  if (pdfResult) {
    result.bookFile = {
      url: pdfResult.key,
      publicId: pdfResult.key,
      fileSize: files.pdf[0].size,
      originalName: files.pdf[0].originalname,
    };
  }

  return result;
};

// ── Helper: parse comma-separated or array values from form-data ───────────────
const parseArray = (value) => {
  if (!value) return [];
  return Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new book upload request
// @route   POST /api/book-requests
// @access  Private (any logged-in user)
// ─────────────────────────────────────────────────────────────────────────────
export const submitBookRequest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    genre,
    category,
    language,
    isbn,
    publishedYear,
    pageCount,
    price,
    authorNote,
  } = req.body;

  // Upload files to Cloudinary
  const uploadedFiles = await processFiles(req.files);

  const bookRequest = await BookRequest.create({
    user: req.user._id,
    title: title?.trim(),
    description: description?.trim(),
    genre: parseArray(genre),
    category,
    language: language || "English",
    isbn: isbn?.trim() || undefined,
    publishedYear: publishedYear ? Number(publishedYear) : undefined,
    pageCount: pageCount ? Number(pageCount) : undefined,
    price: price !== undefined ? Number(price) : 0,
    authorNote: authorNote?.trim() || undefined,
    ...uploadedFiles,
  });

  // Notify user by email (non-blocking — never crash the request)
  sendBookRequestReceivedEmail(req.user, bookRequest).catch((e) =>
    console.error("[Email] sendBookRequestReceivedEmail failed:", e.message),
  );

  res.status(201).json({
    success: true,
    message:
      "Request submitted! Our team will review it within 3–5 business days.",
    data: bookRequest,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all book requests submitted by the logged-in user
// @route   GET /api/book-requests/my
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMyBookRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [requests, total] = await Promise.all([
    BookRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("reviewedBy", "name")
      .select("-bookFile.url"), // hide direct PDF link from listing
    BookRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: requests,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single book request (owner only)
// @route   GET /api/book-requests/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getBookRequest = asyncHandler(async (req, res) => {
  const request = await BookRequest.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("reviewedBy", "name");

  if (!request) {
    res.status(404);
    throw new Error("Book request not found");
  }

  res.json({ success: true, data: request });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a pending/revision_requested book request
// @route   PUT /api/book-requests/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateBookRequest = asyncHandler(async (req, res) => {
  const request = await BookRequest.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!request) {
    res.status(404);
    throw new Error("Book request not found");
  }

  const editableStatuses = ["pending", "revision_requested"];
  if (!editableStatuses.includes(request.status)) {
    res.status(400);
    throw new Error(
      `Cannot edit a request with status "${request.status}". Only pending or revision-requested requests can be edited.`,
    );
  }

  // Update text fields
  const fields = [
    "title",
    "description",
    "language",
    "isbn",
    "publishedYear",
    "pageCount",
    "price",
    "authorNote",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) request[field] = req.body[field];
  });

  if (req.body.genre) request.genre = parseArray(req.body.genre);

  // Handle new file uploads (replace old ones)
  if (req.files && Object.keys(req.files).length > 0) {
    // Delete old Cloudinary files before replacing
    if (req.files.image && request.coverImage?.publicId) {
      await cloudinary.v2.uploader
        .destroy(request.coverImage.publicId)
        .catch(() => {});
    }
    if (req.files.pdf && request.bookFile?.publicId) {
      await s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: request.bookFile.publicId,
          }),
        )
        .catch(() => {});
    }

    const uploaded = await processFiles(req.files);
    Object.assign(request, uploaded);
  }

  // If resubmitting after a revision request → reset to pending
  if (request.status === "revision_requested") {
    request.statusHistory.push({
      status: "revision_requested",
      changedBy: req.user._id,
      feedback: "Author resubmitted after revision request",
    });
    request.status = "pending";
    request.adminFeedback = undefined;
  }

  const updated = await request.save();

  res.json({
    success: true,
    message: "Book request updated successfully",
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Withdraw (delete) a pending or rejected book request
// @route   DELETE /api/book-requests/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteBookRequest = asyncHandler(async (req, res) => {
  const request = await BookRequest.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!request) {
    res.status(404);
    throw new Error("Book request not found");
  }

  if (!["pending", "rejected"].includes(request.status)) {
    res.status(400);
    throw new Error("You can only withdraw pending or rejected requests");
  }

  // Clean up Cloudinary files
  if (request.coverImage?.publicId) {
    await cloudinary.v2.uploader
      .destroy(request.coverImage.publicId)
      .catch(() => {});
  }
  if (request.bookFile?.publicId) {
    await s3Client
      .send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: request.bookFile.publicId, // we stored the S3 key as publicId
        }),
      )
      .catch(() => {});
  }
  await request.deleteOne();

  res.json({ success: true, message: "Book request withdrawn successfully" });
});
