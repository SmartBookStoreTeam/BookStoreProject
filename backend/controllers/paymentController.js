import Order from "../models/Order.js";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────────
// Helper: fulfil an approved order
// (called from webhook after payment confirmed)
// ─────────────────────────────────────────────
const fulfilOrder = async (order) => {
  if (order.status === "approved") return; // idempotent

  order.status = "approved";
  order.approvedAt = new Date();
  await order.save();

  // Mark coupon as used
  if (order.coupon?.code && order.coupon.code !== "FIRST_ORDER") {
    await Coupon.updateOne(
      { code: order.coupon.code },
      { $addToSet: { usedBy: order.user } },
    );
  }

  // Add books to user's library
  await Promise.all(
    order.items.map((it) =>
      LibraryItem.updateOne(
        { user: order.user, book: it.book },
        {
          $set: { accessStatus: "active", order: order._id },
          $setOnInsert: { purchasedAt: new Date() },
        },
        { upsert: true },
      ),
    ),
  );

  // Update book sales count
  await Promise.all(
    order.items.map((it) =>
      Book.updateOne({ _id: it.book }, { $inc: { sales: it.quantity } }),
    ),
  );

  // Remove purchased books from cart
  try {
    const purchasedBookIds = order.items.map((it) => it.book);
    await Cart.updateOne(
      { user: order.user },
      { $pull: { items: { book: { $in: purchasedBookIds } } } },
    );
  } catch (cartErr) {
    console.warn("⚠️ Could not clear cart after purchase:", cartErr.message);
  }

  console.log("✅ Order fulfilled:", order._id);
};

// ─────────────────────────────────────────────
// POST /api/payments/checkout
// Creates a Stripe Checkout Session
// ─────────────────────────────────────────────
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items, couponCode, isFirstOrder } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // 1) Fetch books from DB — never trust prices from frontend
    const bookIds = items.map((i) => i.bookId);
    const books = await Book.find({
      _id: { $in: bookIds },
      isActive: true,
      status: "available",
    }).select("title price");

    if (books.length !== bookIds.length) {
      return res.status(400).json({ message: "Some books are not available" });
    }

    // 2) Build order items + subtotal
    const orderItems = items.map((i) => {
      const book = books.find((b) => String(b._id) === String(i.bookId));
      const qty = Math.max(1, Number(i.quantity || 1));
      return {
        book: book._id,
        titleSnapshot: book.title,
        priceSnapshot: book.price,
        quantity: qty,
      };
    });

    const subtotal = orderItems.reduce(
      (acc, it) => acc + it.priceSnapshot * it.quantity,
      0,
    );

    // 3) Apply coupon / first-order discount
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedCouponCode = null;
    let discountLabel = null;

    if (couponCode) {
      const couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (!couponDoc)
        return res.status(400).json({ message: "Invalid coupon code" });

      if (new Date() > couponDoc.expiresAt)
        return res.status(400).json({ message: "Coupon has expired" });

      if (
        couponDoc.maxUses !== null &&
        couponDoc.usedBy.length >= couponDoc.maxUses
      )
        return res
          .status(400)
          .json({ message: "Coupon has reached its maximum uses" });

      const alreadyUsed = couponDoc.usedBy.some(
        (uid) => String(uid) === String(req.user._id),
      );
      if (alreadyUsed)
        return res
          .status(400)
          .json({ message: "You have already used this coupon" });

      discountPercent = couponDoc.discountPercent;
      discountAmount = Math.round((subtotal * discountPercent) / 100);
      appliedCouponCode = couponDoc.code;
      discountLabel = "coupon";
    } else if (isFirstOrder) {
      const existingOrdersCount = await Order.countDocuments({
        user: req.user._id,
        status: "approved",
      });

      if (existingOrdersCount === 0) {
        const cheapestItem = orderItems.reduce((min, it) =>
          it.priceSnapshot < min.priceSnapshot ? it : min,
        );
        discountAmount =
          Math.round(cheapestItem.priceSnapshot * 0.5 * 100) / 100;
        discountPercent = Math.round((discountAmount / subtotal) * 100);
        appliedCouponCode = "FIRST_ORDER";
        discountLabel = "first_order";
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // 4) Create order in DB with status "requested"
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      currency: "egp",
      subtotal,
      total,
      status: "requested",
      paymentProvider: "stripe",
      coupon: {
        code: appliedCouponCode,
        discountPercent,
        discountAmount,
      },
    });

    // 5) Build Stripe line items
    const lineItems = orderItems.map((it) => {
      // If coupon: discount proportionally; if first_order: discount cheapest
      let unitPrice = it.priceSnapshot;

      if (discountLabel === "first_order") {
        const cheapestPrice = orderItems.reduce(
          (min, x) => Math.min(min, x.priceSnapshot),
          Infinity,
        );
        if (it.priceSnapshot === cheapestPrice) {
          unitPrice = Math.max(0, it.priceSnapshot - discountAmount);
        }
      } else if (discountLabel === "coupon") {
        unitPrice = it.priceSnapshot * (1 - discountPercent / 100);
      }

      return {
        price_data: {
          currency: "egp",
          product_data: { name: it.titleSnapshot },
          // Stripe expects amounts in smallest currency unit (piastres)
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: it.quantity,
      };
    });

    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    // 6) Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?order_id=${order._id}`,
      customer_email: req.user.email,
      metadata: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    });

    // 7) Save Stripe session ID in order
    order.stripe = { sessionId: session.id };
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        checkoutUrl: session.url, // Frontend redirects here
        discount: {
          code: appliedCouponCode,
          discountLabel,
          discountPercent,
          discountAmount,
          subtotal,
          total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/payments/webhook
// Stripe calls this after payment events
// Must use raw body — see paymentRoutes.js
// ─────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer — NOT parsed JSON
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("❌ Stripe webhook signature failed:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const order = await Order.findById(session.metadata.orderId);
      if (!order) {
        console.error("❌ Order not found for session:", session.id);
        return res.json({ received: true });
      }

      order.stripe = {
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
      };

      await fulfilOrder(order);
    } catch (err) {
      console.error("❌ Error fulfilling order:", err.message);
      return res.status(500).json({ message: "Order fulfilment failed" });
    }
  }

  return res.json({ received: true });
};

// ─────────────────────────────────────────────
// GET /api/payments/verify?session_id=xxx
// Frontend calls this on the success page
// to confirm payment and get order details
// ─────────────────────────────────────────────
export const verifySession = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id)
      return res.status(400).json({ message: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ message: "Payment not completed" });
    }

    const order = await Order.findById(session.metadata.orderId).populate(
      "items.book",
      "title coverImage",
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Fulfil in case webhook was delayed
    await fulfilOrder(order);

    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/payments/cancel/:orderId
// ─────────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "approved") {
      return res.status(400).json({ message: "Cannot cancel a paid order" });
    }

    order.status = "canceled";
    await order.save();

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
