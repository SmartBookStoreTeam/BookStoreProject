import Book from "../models/Book.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public -> all users
export const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
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
