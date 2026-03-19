import Coupon from "../models/Coupon.js";
import crypto from "crypto";

/**
 * Helper — generate a random coupon code
 * e.g. "BOOK-A3F9-X7K2"
 */
const generateCode = () => {
  const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `BOOK-${part1}-${part2}`;
};

/**
 * POST /api/coupons/apply
 * User applies a coupon code before checkout
 * Returns discount percent if valid
 */
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check expiry
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check max uses
    if (coupon.maxUses !== null && coupon.usedBy.length >= coupon.maxUses) {
      return res
        .status(400)
        .json({ message: "Coupon has reached its maximum uses" });
    }

    // Check if user already used this coupon
    const alreadyUsed = coupon.usedBy.some(
      (userId) => String(userId) === String(req.user._id),
    );
    if (alreadyUsed) {
      return res
        .status(400)
        .json({ message: "You have already used this coupon" });
    }

    return res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/coupons
 * Admin creates a coupon manually
 */
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, expiresAt, maxUses } = req.body;

    if (!discountPercent || !expiresAt) {
      return res
        .status(400)
        .json({ message: "discountPercent and expiresAt are required" });
    }

    const couponCode = code ? code.toUpperCase().trim() : generateCode();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: couponCode });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: couponCode,
      discountPercent,
      expiresAt: new Date(expiresAt),
      maxUses: maxUses || null,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/coupons/generate
 * Admin auto-generates a coupon with a random code
 */
export const generateCoupon = async (req, res, next) => {
  try {
    const { discountPercent, expiresAt, maxUses } = req.body;

    if (!discountPercent || !expiresAt) {
      return res
        .status(400)
        .json({ message: "discountPercent and expiresAt are required" });
    }

    // Keep generating until we get a unique code
    let code;
    let exists = true;
    while (exists) {
      code = generateCode();
      exists = await Coupon.findOne({ code });
    }

    const coupon = await Coupon.create({
      code,
      discountPercent,
      expiresAt: new Date(expiresAt),
      maxUses: maxUses || null,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/coupons
 * Admin lists all coupons
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .select("-usedBy");

    return res.status(200).json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/coupons/:id
 * Admin deletes a coupon
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    return res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/coupons/:id/toggle
 * Admin activates or deactivates a coupon
 */
export const toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};
