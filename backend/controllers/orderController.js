import Order from "../models/Order.js";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });
    }

    // Recalculate prices on server side for security
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const bookId = item.book || item.id;
      const book = await Book.findById(bookId).select(
        "title price isActive status pdf"
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book not found: ${item.titleSnapshot || bookId}`,
        });
      }

      if (book.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `"${book.title}" is not available`,
        });
      }

      // Check if user already owns this active book
      const alreadyOwned = await LibraryItem.findOne({
        user: userId,
        book: book._id,
        accessStatus: "active",
      });

      if (alreadyOwned) {
        return res.status(400).json({
          success: false,
          message: `You already own "${book.title}"`,
        });
      }

      const price = Number(book.price);
      orderItems.push({
        book: book._id,
        titleSnapshot: book.title,
        priceSnapshot: price,
        quantity: 1,
      });

      subtotal += price;
    }

    const total = subtotal; // Add tax logic if needed

    const order = await Order.create({
      user: userId,
      items: orderItems,
      currency: "egp",
      subtotal,
      total,
      status: "requested",
      paymentProvider: paymentMethod || "manual",
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
