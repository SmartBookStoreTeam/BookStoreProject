import UserActivity from "../models/UserActivity.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";

// ─── helper: get user or sessionId ───────────────────────────────────────────
const getIdentifier = (req) => ({
  user: req.user?._id || req.user?.id || null,
  sessionId: req.headers["x-session-id"] || null,
});

// ─── POST /api/tracking/view ──────────────────────────────────────────────────
export const trackView = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, error: "Invalid bookId" });
    }

    const { user, sessionId } = getIdentifier(req);
    if (!user && !sessionId) {
      return res.json({ success: true }); // skip anonymous with no session
    }

    const book = await Book.findById(bookId).select("categories");
    if (!book) return res.json({ success: true });

    // avoid duplicate views within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const alreadyViewed = await UserActivity.findOne({
      ...(user ? { user } : { sessionId }),
      type: "view",
      book: bookId,
      createdAt: { $gte: oneHourAgo },
    });

    if (!alreadyViewed) {
      await UserActivity.create({
        user,
        sessionId,
        type: "view",
        book: bookId,
        categories: book.categories || [],
      });

      // increment book views counter
      await Book.findByIdAndUpdate(bookId, { $inc: { views: 1 } });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("trackView error:", err);
    res.json({ success: true }); // never break the frontend
  }
};

// ─── POST /api/tracking/search ────────────────────────────────────────────────
export const trackSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2) {
      return res.json({ success: true });
    }

    const { user, sessionId } = getIdentifier(req);
    if (!user && !sessionId) return res.json({ success: true });

    await UserActivity.create({
      user,
      sessionId,
      type: "search",
      searchQuery: query.trim().toLowerCase(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("trackSearch error:", err);
    res.json({ success: true });
  }
};

// ─── POST /api/tracking/purchase ─────────────────────────────────────────────
export const trackPurchase = async (req, res) => {
  try {
    const { bookIds } = req.body; // array of bookIds
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.json({ success: true });
    }

    const { user, sessionId } = getIdentifier(req);
    if (!user && !sessionId) return res.json({ success: true });

    const validIds = bookIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );
    const books = await Book.find({ _id: { $in: validIds } }).select(
      "categories",
    );

    const activities = books.map((book) => ({
      user,
      sessionId,
      type: "purchase",
      book: book._id,
      categories: book.categories || [],
    }));

    await UserActivity.insertMany(activities);
    res.json({ success: true });
  } catch (err) {
    console.error("trackPurchase error:", err);
    res.json({ success: true });
  }
};

// ─── GET /api/tracking/suggestions ───────────────────────────────────────────
// Returns personalized book suggestions based on user activity
export const getSuggestions = async (req, res) => {
  try {
    const { user, sessionId } = getIdentifier(req);
    const limit = parseInt(req.query.limit) || 10;

    let suggestedBooks = [];

    // ── Strategy 1: Personalized (if user has activity) ──────────────────────
    if (user || sessionId) {
      const matchFilter = user ? { user } : { sessionId };

      // get user's recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const activities = await UserActivity.find({
        ...matchFilter,
        createdAt: { $gte: thirtyDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // collect viewed/purchased bookIds and categories
      const viewedBookIds = activities
        .filter((a) => a.type === "view" || a.type === "purchase")
        .map((a) => a.book)
        .filter(Boolean);

      const categoryIds = activities
        .flatMap((a) => a.categories || [])
        .filter(Boolean);

      // use vector search if we have viewed books with embeddings
      if (viewedBookIds.length > 0) {
        // get the most recently viewed book that has an embedding
        const recentBook = await Book.findOne({
          _id: { $in: viewedBookIds },
          embedding: { $exists: true, $ne: [] },
        }).select("embedding");

        if (recentBook?.embedding?.length > 0) {
          // vector search based on recent interest
          const pipeline = [
            {
              $vectorSearch: {
                index: "Recommendtion",
                path: "embedding",
                queryVector: recentBook.embedding,
                numCandidates: 100,
                limit: limit + viewedBookIds.length, // fetch extra to filter out viewed
              },
            },
            {
              $match: {
                _id: { $nin: viewedBookIds }, // exclude already viewed
                isActive: true,
                status: "available",
              },
            },
            { $limit: limit },
            { $project: { embedding: 0 } },
            {
              $addFields: {
                score: { $meta: "vectorSearchScore" },
                suggestionType: "personalized",
              },
            },
          ];

          suggestedBooks = await Book.aggregate(pipeline);
        }

        // fallback: category-based if vector search returned too few
        if (suggestedBooks.length < limit && categoryIds.length > 0) {
          const needed = limit - suggestedBooks.length;
          const existingIds = [
            ...viewedBookIds,
            ...suggestedBooks.map((b) => b._id),
          ];

          const categoryBooks = await Book.find({
            categories: { $in: categoryIds },
            _id: { $nin: existingIds },
            isActive: true,
            status: "available",
          })
            .select("-embedding")
            .sort({ ratingAvg: -1, sales: -1 })
            .limit(needed)
            .lean();

          const withType = categoryBooks.map((b) => ({
            ...b,
            suggestionType: "category_based",
          }));

          suggestedBooks = [...suggestedBooks, ...withType];
        }
      }
    }

    // ── Strategy 2: Popular fallback (if no activity or not enough results) ──
    if (suggestedBooks.length < limit) {
      const needed = limit - suggestedBooks.length;
      const existingIds = suggestedBooks.map((b) => b._id);

      const popularBooks = await Book.find({
        _id: { $nin: existingIds },
        isActive: true,
        status: "available",
        approvalStatus: "approved",
      })
        .select("-embedding")
        .sort({ views: -1, sales: -1, ratingAvg: -1 })
        .limit(needed)
        .lean();

      const withType = popularBooks.map((b) => ({
        ...b,
        suggestionType: "popular",
      }));

      suggestedBooks = [...suggestedBooks, ...withType];
    }

    res.json({ success: true, data: suggestedBooks });
  } catch (err) {
    console.error("getSuggestions error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/tracking/trending ──────────────────────────────────────────────
// Most viewed books in last 7 days
export const getTrending = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await UserActivity.aggregate([
      {
        $match: {
          type: "view",
          createdAt: { $gte: sevenDaysAgo },
          book: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$book",
          viewCount: { $sum: 1 },
        },
      },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $match: {
          "book.isActive": true,
          "book.status": "available",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$book",
              { viewCount: "$viewCount", suggestionType: "trending" },
            ],
          },
        },
      },
      { $project: { embedding: 0 } },
    ]);

    // fallback to popular if not enough trending data
    if (trending.length < limit) {
      const needed = limit - trending.length;
      const existingIds = trending.map((b) => b._id);

      const popular = await Book.find({
        _id: { $nin: existingIds },
        isActive: true,
        status: "available",
      })
        .select("-embedding")
        .sort({ views: -1, sales: -1 })
        .limit(needed)
        .lean();

      return res.json({
        success: true,
        data: [
          ...trending,
          ...popular.map((b) => ({ ...b, suggestionType: "popular" })),
        ],
      });
    }

    res.json({ success: true, data: trending });
  } catch (err) {
    console.error("getTrending error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
