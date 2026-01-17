import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },

    accessStatus: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
      index: true,
    },

    purchasedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

libraryItemSchema.index({ user: 1, book: 1 }, { unique: true });
libraryItemSchema.index({ user: 1, purchasedAt: -1 });

const LibraryItem = mongoose.model("LibraryItem", libraryItemSchema);
export default LibraryItem;
