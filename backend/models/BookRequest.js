import mongoose from "mongoose";

const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Biography",
  "History",
  "Self-Help",
  "Science",
  "Technology",
  "Children",
  "Young Adult",
  "Poetry",
  "Drama",
  "Other",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    feedback: { type: String },
  },
  { timestamps: true },
);

const bookRequestSchema = new mongoose.Schema(
  {
    // ── Who submitted it ───────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Book Metadata ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    genre: {
      type: [String],
      required: [true, "At least one genre is required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one genre is required",
      },
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      default: "English",
    },
    isbn: {
      type: String,
      trim: true,
      sparse: true,
      match: [
        /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,
        "Please provide a valid ISBN",
      ],
    },
    publishedYear: {
      type: Number,
      min: [1000, "Invalid year"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    pageCount: { type: Number, min: [1, "Page count must be at least 1"] },
    price: { type: Number, default: 0, min: [0, "Price cannot be negative"] },

    // Optional message to the admin team
    authorNote: {
      type: String,
      maxlength: [2000, "Note cannot exceed 2000 characters"],
    },

    // ── Uploaded Files (Cloudinary) ────────────────────────────────────────────
    coverImage: {
      url: { type: String },
      publicId: { type: String }, // for Cloudinary deletion
    },
    bookFile: {
      url: { type: String },
      publicId: { type: String },
      fileSize: { type: Number }, // bytes
      originalName: { type: String },
    },

    // ── Review Status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "revision_requested",
        "approved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
    adminFeedback: {
      type: String,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    // Full audit trail of every status change
    statusHistory: [statusHistorySchema],

    // ── After Approval: link to the real Book document ─────────────────────────
    publishedBook: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  },
  { timestamps: true },
);

// Compound indexes for common admin queries
bookRequestSchema.index({ status: 1, createdAt: -1 });
bookRequestSchema.index({ user: 1, status: 1 });

const BookRequest = mongoose.model("BookRequest", bookRequestSchema);
export default BookRequest;
