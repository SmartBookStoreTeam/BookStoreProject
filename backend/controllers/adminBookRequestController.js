import asyncHandler from "express-async-handler";
import BookRequest from "../models/BookRequest.js";
import Book from "../models/Book.js";
import { sendBookRequestStatusEmail } from "../emails/bookRequestEmails.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all book requests with filters, search, pagination
// @route   GET /api/admin/book-requests
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllBookRequests = asyncHandler(async (req, res) => {
  const {
    status,
    userId,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (search) filter.title = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === "asc" ? 1 : -1;

  const [requests, total, statusStats] = await Promise.all([
    BookRequest.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name"),

    BookRequest.countDocuments(filter),

    // Aggregate counts per status for dashboard badge numbers
    BookRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const stats = statusStats.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: requests,
    stats, // { pending: 5, approved: 12, rejected: 3, ... }
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single book request (full detail for admin, includes PDF url)
// @route   GET /api/admin/book-requests/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getBookRequestById = asyncHandler(async (req, res) => {
  const request = await BookRequest.findById(req.params.id)
    .populate("user", "name email avatar createdAt")
    .populate("reviewedBy", "name email")
    .populate("statusHistory.changedBy", "name");

  if (!request) {
    res.status(404);
    throw new Error("Book request not found");
  }

  res.json({ success: true, data: request });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Review a book request (change status + optional feedback)
// @route   PUT /api/admin/book-requests/:id/review
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const reviewBookRequest = asyncHandler(async (req, res) => {
  const { status, adminFeedback } = req.body;

  const VALID_STATUSES = [
    "under_review",
    "approved",
    "rejected",
    "revision_requested",
  ];
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  if (
    ["rejected", "revision_requested"].includes(status) &&
    !adminFeedback?.trim()
  ) {
    res.status(400);
    throw new Error(
      "adminFeedback is required when rejecting or requesting a revision",
    );
  }

  const request = await BookRequest.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (!request) {
    res.status(404);
    throw new Error("Book request not found");
  }

  if (request.status === "approved") {
    res.status(400);
    throw new Error("This request is already approved and published");
  }

  // ── Save previous state to history ────────────────────────────────────────
  request.statusHistory.push({
    status: request.status,
    changedBy: req.user._id,
    feedback: adminFeedback || null,
  });

  // ── Apply new state ────────────────────────────────────────────────────────
  request.status = status;
  request.adminFeedback = adminFeedback?.trim() || undefined;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();

  // ── On APPROVAL: create the real Book document ─────────────────────────────
  if (status === "approved") {
    // ✅ تحقق قبل الإنشاء
    if (!request.coverImage?.url) {
      res.status(400);
      throw new Error("Cannot approve request without image");
    }

    if (!request.bookFile?.url) {
      res.status(400);
      throw new Error("Cannot approve request without PDF");
    }

    const exists = await Book.findOne({ sourceRequest: request._id });

    if (!exists) {
      await Book.create({
        title: request.title,
        description: request.description,
        author: request.user.name,
        category: request.category,
        price: request.price,
        image: request.coverImage.url, // ✅ خلاص ضامنين وجوده
        pdf: request.bookFile.url,
        isbn: request.isbn || undefined,
        year: request.publishedYear?.toString(),
        fileMeta: {
          size: request.bookFile?.fileSize,
          mime: "application/pdf",
        },
      });
    }
  }

  await request.save();

  // ── Email notification ─────────────────────────────────────────────────────
  sendBookRequestStatusEmail(request.user, request).catch((e) =>
    console.error("[Email] sendBookRequestStatusEmail failed:", e.message),
  );

  res.json({
    success: true,
    message: `Request marked as "${status}" successfully`,
    data: request,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Quick stats for admin dashboard widget
// @route   GET /api/admin/book-requests/stats
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getBookRequestStats = asyncHandler(async (req, res) => {
  const [byStatus, recentPending] = await Promise.all([
    BookRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    BookRequest.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email"),
  ]);

  res.json({
    success: true,
    data: {
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      recentPending,
    },
  });
});
