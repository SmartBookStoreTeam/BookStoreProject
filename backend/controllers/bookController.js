import Book from "../models/Book.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

// @desc    Get all books
// @route   GET /api/books
// @access  Public -> all users
export const getBooks = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const filter = { isActive: true, status: "available" };

    if (req.query.category) {
      const cats = typeof req.query.category === 'string' ? req.query.category.split(',') : (Array.isArray(req.query.category) ? req.query.category : [req.query.category]);
      filter.categories = { $in: cats };
    }
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: "i" };
    }

    if (req.query.isbn) filter.isbn = req.query.isbn;

    if (req.query.minPrice)
      filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice)
      filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };

    const sort = req.query.sort || "-createdAt"; // e.g. price, -price, -ratings

    const total = await Book.countDocuments(filter);
    let books;

    // Custom sorting if multiple categories are selected
    if (req.query.category && typeof req.query.category === 'string' && req.query.category.includes(',')) {
      const cats = req.query.category.split(',');
      const allBooks = await Book.find(filter)
        .select("+pdf")
        .populate("categories", "name slug")
        .lean();

      allBooks.sort((a, b) => {
        const aMatches = a.categories ? a.categories.filter(c => cats.includes(String(c._id))).length : 0;
        const bMatches = b.categories ? b.categories.filter(c => cats.includes(String(c._id))).length : 0;
        
        // Sort by match count descending, then by createdAt descending
        return bMatches - aMatches || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      books = allBooks.slice(pageSize * (page - 1), pageSize * page);
    } else {
      books = await Book.find(filter)
        .select("+pdf") // ✅ Include PDF field
        .populate("categories", "name slug")
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    }

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
    const book = await Book.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .select("+pdf") // ✅ Include PDF field
      .populate("categories", "name slug");

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
// @route   GET /api/books/search?q=xyz
// @access  Public -> all users
export const searchBooks = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const q = req.query.q?.trim();
    const sort = req.query.sort || "-createdAt"; // title, -price, ...etc

    const filter = { isActive: true };

    if (category) {
      const cats = typeof category === 'string' ? category.split(',') : (Array.isArray(category) ? category : [category]);
      filter.categories = { $in: cats };
    }

    if (req.query.minPrice)
      filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice)
      filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };

    // ✅ Regex search for partial matching (Better for autocomplete)
    if (q) {
      const regex = new RegExp(q, "i");

      // Find categories matching the search term
      const matchedCategories = await Category.find({
        name: { $regex: regex },
      }).select("_id");

      const categoryIds = matchedCategories.map((c) => c._id);

      filter.$or = [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { isbn: { $regex: regex } },
        { categories: { $in: categoryIds } }, // Also search by category name
      ];
    }

    const total = await Book.countDocuments(filter);

    let books;

    if (category && typeof category === 'string' && category.includes(',')) {
      const cats = category.split(',');
      let allBooks = await Book.find(filter)
        .select("+pdf")
        .populate("categories", "name slug")
        .lean();

      allBooks.sort((a, b) => {
        const aMatches = a.categories ? a.categories.filter(c => cats.includes(String(c._id))).length : 0;
        const bMatches = b.categories ? b.categories.filter(c => cats.includes(String(c._id))).length : 0;
        return bMatches - aMatches || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      books = allBooks.slice(pageSize * (page - 1), pageSize * page);
    } else {
      let query = Book.find(filter).populate("categories", "name slug");
      query = query.sort(sort);
      books = await query
        .select("+pdf") // ✅ Include PDF field
        .populate("categories", "name slug")
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    }

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

// ✅ helper: يحوّل sort string زي "-price" أو "title" لـ object
function parseSort(sortStr) {
  // لو جالك object من أي مكان سيبه
  if (!sortStr || typeof sortStr !== "string") return {};

  // مثال: "-price" => { price: -1 } | "title" => { title: 1 }
  const field = sortStr.startsWith("-") ? sortStr.slice(1) : sortStr;
  const dir = sortStr.startsWith("-") ? -1 : 1;

  // لو sortStr فيها كذا field (اختياري): "price,-createdAt"
  if (sortStr.includes(",")) {
    const parts = sortStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const obj = {};
    for (const p of parts) {
      const f = p.startsWith("-") ? p.slice(1) : p;
      obj[f] = p.startsWith("-") ? -1 : 1;
    }
    return obj;
  }

  return { [field]: dir };
}

// @desc    Get top rated books
// @route   GET /api/books/top
// @access  Public -> all users
export const getTopBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const books = await Book.find({ isActive: true, status: "available" })
      .select("+pdf") // ✅ Include PDF field
      .populate("categories", "name slug")
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

    const book = await Book.findOne({ _id: req.params.id, isActive: true, status: "available" });

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
      (review) => review.user && review.user.toString() === userId,
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

    // Use the schema method to recalculate
    book.recalculateRating();

    await book.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        ratings: book.ratingAvg,
        numReviews: book.ratingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories with their book counts
// @route   GET /api/books/categories/stats
// @access  Public
export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "books",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$categoryId", { $ifNull: ["$categories", []] }] },
                    { $eq: ["$isActive", true] },
                    { $eq: ["$status", "available"] }
                  ]
                }
              }
            }
          ],
          as: "books"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$books" }
        }
      },
      { $sort: { name: 1 } }
    ]);

    const totalBooks = await Book.countDocuments({ isActive: true, status: "available" });

    res.json({
      success: true,
      data: stats,
      totalBooks
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoriesWithStats = getCategoryStats;

