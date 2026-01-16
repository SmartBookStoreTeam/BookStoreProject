import Book from "../models/Book.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public -> all users
export const getBooks = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.minPrice)
      filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice)
      filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };

    const sort = req.query.sort || "-createdAt"; // e.g. price, -price, -ratings

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: books,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (e) {
    next(e);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public -> all users
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Search books by title or author
// @route   GET /api/books/search?query=xyz
// @access  Public -> all users
export const searchBooks = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const q = req.query.q?.trim();
    const category = req.query.category;
    const sort = req.query.sort || "-createdAt";

    const filter = { isActive: true };

    if (category) filter.category = category;

    // ✅ لو عامل text index
    if (q) {
      filter.$text = { $search: q };
    }

    const total = await Book.countDocuments(filter);

    // ✅ لو $text موجود ممكن نستخدم textScore
    let query = Book.find(filter);

    if (q) query = query.sort({ score: { $meta: "textScore" } });
    else query = query.sort(sort);

    const books = await query.limit(pageSize).skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: books,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated books
// @route   GET /api/books/top
// @access  Public -> all users
export const getTopBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const books = await Book.find({ isActive: true })
      .sort({ ratings: -1, numReviews: -1 })
      .limit(limit);

    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a book
// @route   POST /api/books/:id/rate
// @access  Public
export const rateBook = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const book = await Book.findOne({ _id: req.params.id, isActive: true });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const existingReview = book.reviews.find(
      (review) => review.user && review.user.toString() === userId
    );

    if (existingReview) {
      existingReview.rating = r;
      if (comment !== undefined) existingReview.comment = comment;
    } else {
      book.reviews.push({
        user: userId,
        rating: r,
        comment: comment || "",
      });
    }

    book.numReviews = book.reviews.length;
    book.ratings =
      book.reviews.reduce((sum, rev) => sum + rev.rating, 0) / book.numReviews;

    await book.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        ratings: book.ratings,
        numReviews: book.numReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
