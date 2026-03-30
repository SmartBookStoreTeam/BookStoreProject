import asyncHandler from "express-async-handler";
import AuthorApplication from "../models/AuthorApplication.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
} from "../emails/authorApplicationEmails.js";

// ── Helper: upload base64 signature to Cloudinary ─────────────────────────────
const uploadSignature = async (base64String) => {
  // base64String comes from frontend canvas: "data:image/png;base64,iVBORw0..."
  // Strip the prefix to get raw base64
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const uploaded = await uploadToCloudinary(buffer, {
    folder: "noline/author-signatures",
    transformation: [{ quality: "auto", format: "png" }],
  });

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit author application
// @route   POST /api/author-applications
// @access  Private (logged-in user, role: "user")
// ─────────────────────────────────────────────────────────────────────────────
export const submitApplication = asyncHandler(async (req, res) => {
  const { fullName, phone, nationalId, bio, portfolioUrl, signature } =
    req.body;

  // ── Guard: already an author ───────────────────────────────────────────────
  if (req.user.role === "author") {
    res.status(400);
    throw new Error("You are already an author");
  }

  // ── Guard: already has a pending/approved application ─────────────────────
  const existing = await AuthorApplication.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error(
      `You already have an application with status: "${existing.status}". You cannot submit another one.`,
    );
  }

  // ── Validate signature ────────────────────────────────────────────────────
  if (!signature || !signature.startsWith("data:image")) {
    res.status(400);
    throw new Error(
      "Digital signature is required. Please draw your signature.",
    );
  }

  // ── Upload signature to Cloudinary ────────────────────────────────────────
  const uploadedSignature = await uploadSignature(signature);

  // ── Create application ────────────────────────────────────────────────────
  const application = await AuthorApplication.create({
    user: req.user._id,
    fullName: fullName?.trim(),
    phone: phone?.trim(),
    nationalId: nationalId?.trim(),
    bio: bio?.trim(),
    portfolioUrl: portfolioUrl?.trim() || undefined,
    signature: uploadedSignature,
  });

  // ── Send confirmation email ───────────────────────────────────────────────
  sendApplicationReceivedEmail(req.user, application).catch((e) =>
    console.error("[Email] sendApplicationReceivedEmail failed:", e.message),
  );

  res.status(201).json({
    success: true,
    message:
      "Application submitted successfully! We will review it within 3–5 business days.",
    data: {
      _id: application._id,
      status: application.status,
      createdAt: application.createdAt,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get my application status
// @route   GET /api/author-applications/my
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMyApplication = asyncHandler(async (req, res) => {
  const application = await AuthorApplication.findOne({
    user: req.user._id,
  })
    .populate("reviewedBy", "name")
    .select("-signature"); // don't expose signature URL in listing

  if (!application) {
    res.status(404);
    throw new Error("You have not submitted an author application yet");
  }

  res.json({ success: true, data: application });
});
