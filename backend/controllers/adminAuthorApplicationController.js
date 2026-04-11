import asyncHandler from "express-async-handler";
import AuthorApplication from "../models/AuthorApplication.js";
import User from "../models/User.js";
import { sendApplicationStatusEmail } from "../emails/authorApplicationEmails.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all author applications with filters & pagination
// @route   GET /api/admin/author-applications
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllApplications = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.fullName = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === "asc" ? 1 : -1;

  const [applications, total, statusStats] = await Promise.all([
    AuthorApplication.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email avatar createdAt")
      .populate("reviewedBy", "name")
      .select("-signature"), // hide signature in listing, show in detail only

    AuthorApplication.countDocuments(filter),

    AuthorApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const stats = statusStats.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: applications,
    stats, // { pending: 3, approved: 10, rejected: 2 }
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single application full detail (includes signature)
// @route   GET /api/admin/author-applications/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await AuthorApplication.findById(req.params.id)
    .populate("user", "name email avatar createdAt role")
    .populate("reviewedBy", "name email")
    .populate("statusHistory.changedBy", "name");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.json({ success: true, data: application });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Review an author application (approve / reject / under_review)
// @route   PUT /api/admin/author-applications/:id/review
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const reviewApplication = asyncHandler(async (req, res) => {
  const { status, adminFeedback } = req.body;

  const VALID_STATUSES = ["under_review", "approved", "rejected"];
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  if (status === "rejected" && !adminFeedback?.trim()) {
    res.status(400);
    throw new Error("adminFeedback is required when rejecting an application");
  }

  const application = await AuthorApplication.findById(req.params.id).populate(
    "user",
    "name email role",
  );

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status === "approved") {
    res.status(400);
    throw new Error("This application is already approved");
  }

  // ── Save previous state to history ────────────────────────────────────────
  application.statusHistory.push({
    status: application.status,
    changedBy: req.user._id,
    feedback: adminFeedback || null,
  });

  // ── Apply new state ────────────────────────────────────────────────────────
  application.status = status;
  application.adminFeedback = adminFeedback?.trim() || undefined;
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();

  // ── On APPROVAL: upgrade user role to "author" ─────────────────────────────
  if (status === "approved") {
    await User.findByIdAndUpdate(application.user._id, { role: "author" });
  }

  await application.save();

  // ── Email notification ─────────────────────────────────────────────────────
  sendApplicationStatusEmail(application.user, application).catch((e) =>
    console.error("[Email] sendApplicationStatusEmail failed:", e.message),
  );

  res.json({
    success: true,
    message: `Application ${status} successfully`,
    data: application,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get stats for admin dashboard
// @route   GET /api/admin/author-applications/stats
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getApplicationStats = asyncHandler(async (req, res) => {
  const [byStatus, recentPending] = await Promise.all([
    AuthorApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    AuthorApplication.find({ status: "pending" })
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
