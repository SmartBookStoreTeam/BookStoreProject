import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    feedback: { type: String },
  },
  { timestamps: true },
);

const authorApplicationSchema = new mongoose.Schema(
  {
    // ── Linked User ────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one application per user
      index: true,
    },

    // ── Personal Info ──────────────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [120, "Full name cannot exceed 120 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"],
    },
    nationalId: {
      type: String,
      required: [true, "National ID is required"],
      trim: true,
      maxlength: [50, "National ID cannot exceed 50 characters"],
    },

    // ── Professional Info ──────────────────────────────────────────────────────
    bio: {
      type: String,
      required: [true, "Bio is required"],
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    portfolioUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.+/,
        "Portfolio URL must start with http:// or https://",
      ],
    },

    // ── Digital Signature (Cloudinary) ─────────────────────────────────────────
    signatures: {
      type: [
        {
          url: {
            type: String,
            required: [true, "Digital signature URL is required"],
          },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (v) {
          // Optional but recommended: Enforce exactly 3 signatures
          return v && v.length === 3;
        },
        message:
          "You must provide exactly 3 digital signatures for AI verification.",
      },
    },

    // ── Review Status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminFeedback: {
      type: String,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    // ── Full audit trail ───────────────────────────────────────────────────────
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

authorApplicationSchema.index({ status: 1, createdAt: -1 });

const AuthorApplication = mongoose.model(
  "AuthorApplication",
  authorApplicationSchema,
);
export default AuthorApplication;
