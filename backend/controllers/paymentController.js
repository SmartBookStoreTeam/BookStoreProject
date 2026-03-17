import Order from "../models/Order.js";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";
import dotenv from "dotenv";
import {
  getAuthToken,
  registerPaymobOrder,
  getPaymentKey,
  PAYMOB_IFRAME_ID,
} from "../config/paymob.js";
dotenv.config();

/**
 * POST /api/payments/checkout
 * Creates an order in DB, registers it with Paymob, returns iframe URL
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items } = req.body;

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

    // 2) Build order items + totals
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
    const total = subtotal;

    // 3) Create order in DB with status "requested"
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      currency: "egp",
      subtotal,
      total,
      status: "requested",
      paymentProvider: "paymob",
    });

    // 4) Paymob Step 1 — get auth token
    const authToken = await getAuthToken();

    // 5) Paymob Step 2 — register order with Paymob
    const amountCents = Math.round(total * 100);

    const paymobItems = orderItems.map((it) => ({
      name: it.titleSnapshot,
      amount_cents: Math.round(it.priceSnapshot * 100),
      description: it.titleSnapshot,
      quantity: it.quantity,
    }));

    const paymobOrder = await registerPaymobOrder(authToken, {
      amountCents,
      items: paymobItems,
    });

    // 6) Paymob Step 3 — get payment key
    const user = req.user;
    const billingData = {
      first_name: user.name?.split(" ")[0] || "Guest",
      last_name: user.name?.split(" ")[1] || "User",
      email: user.email || "guest@example.com",
      phone_number: user.phone || "01000000000",
      apartment: "NA",
      floor: "NA",
      street: "NA",
      building: "NA",
      shipping_method: "NA",
      postal_code: "NA",
      city: "Cairo",
      country: "EG",
      state: "Cairo",
    };

    const paymentKey = await getPaymentKey(authToken, {
      amountCents,
      paymobOrderId: paymobOrder.id,
      billingData,
    });

    // 7) Save Paymob order ID in our DB order
    order.paymob.orderId = String(paymobOrder.id);
    await order.save();

    // 8) Return iframe URL to frontend
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        iframeUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/webhook
 * Paymob calls this after payment — verified by HMAC middleware
 */
export const paymobWebhook = async (req, res) => {
  try {
    // GET request sends data as query params, POST sends JSON body
    const isGet = req.method === "GET";

    const success = isGet
      ? req.query.success === "true"
      : req.body?.obj?.success === true;
    const paymobOrderId = isGet
      ? String(req.query.order)
      : String(req.body?.obj?.order?.id);
    const transactionId = isGet
      ? String(req.query.id)
      : String(req.body?.obj?.id);

    console.log("📦 Webhook received:", {
      method: req.method,
      success,
      paymobOrderId,
      transactionId,
    });

    if (!success) return res.json({ received: true });
    if (!paymobOrderId) return res.json({ received: true });

    // Find our order by Paymob's order ID
    const order = await Order.findOne({ "paymob.orderId": paymobOrderId });
    if (!order) {
      console.error("❌ Order not found for paymobOrderId:", paymobOrderId);
      return res.json({ received: true });
    }

    // Avoid processing the same webhook twice
    if (order.status === "approved") return res.json({ received: true });

    // Update order status
    order.status = "approved";
    order.approvedAt = new Date();
    order.paymob.transactionId = transactionId;
    await order.save();

    // ✅ Add books to user's library
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

    // ✅ Update book sales count
    await Promise.all(
      order.items.map((it) =>
        Book.updateOne({ _id: it.book }, { $inc: { sales: it.quantity } }),
      ),
    );

    console.log("✅ Paymob payment approved for order:", order._id);
    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Paymob Webhook Error:", err.message);
    return res.status(400).json({ message: "Webhook processing failed" });
  }
};

/**
 * POST /api/payments/cancel/:orderId
 */
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
