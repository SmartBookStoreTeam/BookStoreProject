import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Track which users already used this coupon
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Optional: max number of total uses (null = unlimited)
    maxUses: {
      type: Number,
      default: null,
    },

    // Who created it — null means auto-generated
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// Virtual: check if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

// Virtual: check how many times it has been used
couponSchema.virtual("usedCount").get(function () {
  return this.usedBy.length;
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
