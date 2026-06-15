import asyncHandler from "express-async-handler";
import AuthorApplication from "../models/AuthorApplication.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
} from "../emails/authorApplicationEmails.js";

// ── Helper: upload base64 signature to Cloudinary ─────────────────────────────
const uploadSignature = async (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const uploaded = await uploadToCloudinary(buffer, {
    folder: "bookstore/author-baselines", // Updated folder name for clarity
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
  // 🔴 CHANGED: Expecting 'signatures' (Array) instead of 'signature'
  const { fullName, phone, nationalId, bio, portfolioUrl, signatures } =
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

  // ── Validate 3 Signatures for AI Baseline ─────────────────────────────────
  if (!signatures || !Array.isArray(signatures) || signatures.length !== 3) {
    res.status(400);
    throw new Error(
      "Exactly 3 digital signatures are required to set up your AI Security Baseline.",
    );
  }

  // Ensure all 3 are valid base64 images
  for (const sig of signatures) {
    if (!sig || !sig.startsWith("data:image")) {
      res.status(400);
      throw new Error(
        "One or more signatures have an invalid format. Please draw them again.",
      );
    }
  }

  // ── Upload all 3 signatures to Cloudinary concurrently ────────────────────
  // Promise.all makes this fast by uploading them at the same time
  const uploadedSignatures = await Promise.all(
    signatures.map((sig) => uploadSignature(sig)),
  );

  // ── Create application ────────────────────────────────────────────────────
  const application = await AuthorApplication.create({
    user: req.user._id,
    fullName: fullName?.trim(),
    phone: phone?.trim(),
    nationalId: nationalId?.trim(),
    bio: bio?.trim(),
    portfolioUrl: portfolioUrl?.trim() || undefined,
    signatures: uploadedSignatures, // 🔴 CHANGED: Saving the array of 3 objects
  });

  // ── Send confirmation email ───────────────────────────────────────────────
  sendApplicationReceivedEmail(req.user, application).catch((e) =>
    console.error("[Email] sendApplicationReceivedEmail failed:", e.message),
  );

  res.status(201).json({
    success: true,
    message:
      "Application & AI Security Baseline submitted successfully! We will review it within 3–5 business days.",
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
    .select("-signatures"); // 🔴 CHANGED: Hide the plural array from being exposed

  if (!application) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: application });
});
