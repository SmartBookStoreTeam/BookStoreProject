import Order from "../models/Order.js";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";

export const requestPurchase = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user?._id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!bookId)
      return res
        .status(400)
        .json({ success: false, message: "bookId is required" });

    // If already owned, do not create a new request
    const alreadyOwned = await LibraryItem.findOne({
      user: userId,
      book: bookId,
      accessStatus: "active",
    })
      .select("_id")
      .lean();

    if (alreadyOwned) {
      return res
        .status(400)
        .json({ success: false, message: "You already own this book" });
    }

    const book = await Book.findById(bookId).select(
      "title price isActive status"
    );
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    if (book.isActive === false) {
      return res
        .status(400)
        .json({ success: false, message: "Book is not available" });
    }

    if (book.status && book.status !== "published") {
      return res
        .status(400)
        .json({ success: false, message: "Book is not published" });
    }

    const subtotal = Number(book.price);
    const total = subtotal;

    const order = await Order.create({
      user: userId,
      items: [
        {
          book: book._id,
          titleSnapshot: book.title,
          priceSnapshot: subtotal,
          quantity: 1,
        },
      ],
      currency: "egp",
      subtotal,
      total,
      status: "requested",
      paymentProvider: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Purchase request created",
      data: { orderId: order._id, status: order.status },
    });
  } catch (err) {
    next(err);
  }
};
