import Stripe from "stripe";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items } = req.body;
    // items: [{ bookId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // 1) جِب الكتب من DB (ولا تعتمد على السعر من الفرونت)
    const bookIds = items.map((i) => i.bookId);
    const books = await Book.find({
      _id: { $in: bookIds },
      isActive: true,
      status: "available",
    }).select("title price");

    if (books.length !== bookIds.length) {
      return res.status(400).json({ message: "Some books are not available" });
    }

    // 2) بناء Order snapshots + totals
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
    const total = subtotal; // لو عندك ضريبة/خصم ضيفهم هنا

    // 3) إنشاء Order عندك (requested) + paymentProvider stripe
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      currency: "egp",
      subtotal,
      total,
      status: "requested",
      paymentProvider: "stripe",
    });

    // 4) line_items لـ Stripe
    const line_items = orderItems.map((it) => ({
      quantity: it.quantity,
      price_data: {
        currency: "egp",
        product_data: { name: it.titleSnapshot },
        unit_amount: Math.round(it.priceSnapshot * 100),
      },
    }));

    // 5) إنشاء Checkout Session مع metadata فيها orderId
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // 6) حفظ sessionId داخل order.stripe
    order.stripe.checkoutSessionId = session.id;
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        url: session.url,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Stripe Webhook
 * POST /api/payments/webhook  (RAW BODY)
 */
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId) return res.json({ received: true });

      const order = await Order.findById(orderId);
      if (!order) return res.json({ received: true });

      // (اختياري) تأكد user مطابق
      if (userId && String(order.user) !== String(userId)) {
        console.log("⚠️ User mismatch for order:", orderId);
        return res.json({ received: true });
      }

      if (order.status !== "approved") {
        order.status = "approved";
        order.approvedAt = new Date();
        order.paymentProvider = "stripe";

        order.stripe.checkoutSessionId =
          session.id || order.stripe.checkoutSessionId;
        order.stripe.paymentIntentId =
          session.payment_intent || order.stripe.paymentIntentId;
        order.stripe.customerId = session.customer || order.stripe.customerId;

        await order.save();

        // ✅ Add/activate Library items (required: order)
        await Promise.all(
          order.items.map((it) =>
            LibraryItem.updateOne(
              { user: order.user, book: it.book },
              {
                $set: {
                  accessStatus: "active",
                  order: order._id,
                },
                $setOnInsert: {
                  purchasedAt: new Date(),
                },
              },
              { upsert: true },
            ),
          ),
        );

        // ✅ (optional) update sales
        await Promise.all(
          order.items.map((it) =>
            Book.updateOne({ _id: it.book }, { $inc: { sales: it.quantity } }),
          ),
        );
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// (اختياري) cancel endpoint من عندك
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
