import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    titleSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Order items are required",
      },
    },

    currency: { type: String, default: "egp", lowercase: true },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    coupon: {
      code: { type: String, default: null },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "canceled"],
      default: "requested",
      index: true,
    },

    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },

    adminNote: { type: String, trim: true, maxlength: 500 },

    paymentProvider: { type: String, default: "stripe", index: true },

    // ── Stripe ────────────────────────────────────────────────────────────
    stripe: {
      sessionId: { type: String, default: null }, // ADD: Checkout Session ID
      paymentIntentId: { type: String, default: null }, // already existed, added default
    },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "stripe.sessionId": 1 }); // ADD: fast webhook lookup

const Order = mongoose.model("Order", orderSchema);
export default Order;
