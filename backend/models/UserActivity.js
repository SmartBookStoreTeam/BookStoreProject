import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    // null = guest user (tracked by session)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // fingerprint for guests
    sessionId: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: ["view", "search", "purchase", "cart_add"],
      required: true,
      index: true,
    },

    // for type: "view" | "cart_add" | "purchase"
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
      index: true,
    },

    // for type: "search"
    searchQuery: {
      type: String,
      default: null,
    },

    // categories of viewed book (for faster recommendation queries)
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// compound index for fast user activity lookup
userActivitySchema.index({ user: 1, type: 1, createdAt: -1 });
userActivitySchema.index({ sessionId: 1, type: 1, createdAt: -1 });
userActivitySchema.index({ book: 1, type: 1 });

const UserActivity = mongoose.model("UserActivity", userActivitySchema);
export default UserActivity;
