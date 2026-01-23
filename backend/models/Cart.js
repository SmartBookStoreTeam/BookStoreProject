import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for faster queries
cartSchema.index({ user: 1 });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
