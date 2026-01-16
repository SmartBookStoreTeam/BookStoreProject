import Book from "../models/Book.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public -> all users
export const getBooks = async (req, res, next) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Book.countDocuments();
    const books = await Book.find({ isActive: true })

      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public -> all users
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Search books by title or author
// @route   GET /api/books/search?query=xyz
// @access  Public -> all users
export const searchBooks = async (req, res, next) => {
  try {
    const query = req.query.query || "";
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ],
    });

    res.json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated books
// @route   GET /api/books/top
// @access  Public -> all users
export const getTopBooks = async (req, res, next) => {
  try {
    const books = await Book.find({}).sort({ ratings: -1 }).limit(5);
    res.json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a book
// @route   POST /api/books/:id/rate
// @access  Public
export const rateBook = async (req, res, next) => {
  try {
    const { rating, userId } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user has already rated this book
    const existingReviewIndex = book.reviews.findIndex(
      (review) => review.user && review.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing rating
      book.reviews[existingReviewIndex].rating = rating;
    } else {
      // Add new rating
      book.reviews.push({
        user: userId || null,
        rating: rating,
      });
    }

    // Recalculate average rating from all reviews
    const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / book.reviews.length;

    book.ratings = averageRating;
    book.numReviews = book.reviews.length;

    await book.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rate: book.ratings,
      ratings: book.ratings,
      numReviews: book.numReviews,
    });
  } catch (error) {
    next(error);
  }
};
