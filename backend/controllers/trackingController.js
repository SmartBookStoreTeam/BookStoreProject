import UserActivity from "../models/UserActivity.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";

const getIdentifier = (req) => ({
  user: req.user?._id || req.user?.id || null,
  sessionId: req.headers["x-session-id"] || null,
});

// ─── POST /api/tracking/view ──────────────────────────────────────────────────
export const trackView = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId))
      return res.status(400).json({ success: false, error: "Invalid bookId" });

    const { user, sessionId } = getIdentifier(req);
    if (!user && !sessionId) return res.json({ success: true });

    const book = await Book.findById(bookId).select("categories");
    if (!book) return res.json({ success: true });

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
      await Book.findByIdAndUpdate(bookId, { $inc: { views: 1 } });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("trackView error:", err.message);
    res.json({ success: true });
  }
};

// ─── POST /api/tracking/search ────────────────────────────────────────────────
export const trackSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2) return res.json({ success: true });

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
    console.error("trackSearch error:", err.message);
    res.json({ success: true });
  }
};

// ─── POST /api/tracking/purchase ─────────────────────────────────────────────
export const trackPurchase = async (req, res) => {
  try {
    const { bookIds } = req.body;
    if (!Array.isArray(bookIds) || bookIds.length === 0)
      return res.json({ success: true });

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

    if (activities.length > 0) await UserActivity.insertMany(activities);
    res.json({ success: true });
  } catch (err) {
    console.error("trackPurchase error:", err.message);
    res.json({ success: true });
  }
};

// ─── helper: blend multiple embeddings into one average vector ────────────────
const blendEmbeddings = (embeddings) => {
  if (embeddings.length === 0) return null;
  if (embeddings.length === 1) return embeddings[0];

  const dim = embeddings[0].length;
  const blended = new Array(dim).fill(0);

  // give more weight to recently viewed (index 0 = most recent)
  const weights = embeddings.map((_, i) => 1 / (i + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < embeddings.length; i++) {
    const w = weights[i] / totalWeight;
    for (let d = 0; d < dim; d++) {
      blended[d] += embeddings[i][d] * w;
    }
  }

  return blended;
};

// ─── GET /api/tracking/suggestions ───────────────────────────────────────────
export const getSuggestions = async (req, res) => {
  try {
    const { user, sessionId } = getIdentifier(req);
    const limit = parseInt(req.query.limit) || 10;

    let suggestedBooks = [];

    if (user || sessionId) {
      const matchFilter = user ? { user } : { sessionId };
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const activities = await UserActivity.find({
        ...matchFilter,
        createdAt: { $gte: thirtyDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const viewedBookIds = activities
        .filter((a) => a.type === "view" || a.type === "purchase")
        .map((a) => a.book)
        .filter(Boolean);

      const categoryIds = activities
        .flatMap((a) => a.categories || [])
        .filter(Boolean);

      if (viewedBookIds.length > 0) {
        // ── get up to 5 recently viewed books with embeddings ─────────────────
        const recentBooks = await Book.find({
          _id: { $in: viewedBookIds.slice(0, 10) }, // check last 10
          embedding: { $exists: true, $ne: [] },
        })
          .select("embedding _id")
          .limit(5); // use up to 5 for blending

        if (recentBooks.length > 0) {
          // sort by recency (viewedBookIds order = most recent first)
          const sorted = recentBooks.sort((a, b) => {
            return (
              viewedBookIds.findIndex(
                (id) => id.toString() === a._id.toString(),
              ) -
              viewedBookIds.findIndex(
                (id) => id.toString() === b._id.toString(),
              )
            );
          });

          // blend all embeddings into one weighted average
          const blendedEmbedding = blendEmbeddings(
            sorted.map((b) => b.embedding),
          );

          if (blendedEmbedding) {
            const pipeline = [
              {
                $vectorSearch: {
                  index: "Recommendtion",
                  path: "embedding",
                  queryVector: blendedEmbedding,
                  numCandidates: 150,
                  limit: limit + viewedBookIds.length + 10,
                },
              },
              {
                $match: {
                  _id: { $nin: viewedBookIds }, // exclude ALL viewed books
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
        }

        // category-based fallback
        if (suggestedBooks.length < limit && categoryIds.length > 0) {
          const needed = limit - suggestedBooks.length;
          const existingIds = [
            ...viewedBookIds,
            ...suggestedBooks.map((b) => b._id),
          ];

          // pick from DIFFERENT categories than most viewed
          const topCategoryIds = [...new Set(categoryIds.map(String))].slice(
            0,
            3,
          );

          const categoryBooks = await Book.find({
            categories: { $in: topCategoryIds },
            _id: { $nin: existingIds },
            isActive: true,
            status: "available",
          })
            .select("-embedding")
            .sort({ ratingAvg: -1, sales: -1 })
            .limit(needed)
            .lean();

          suggestedBooks = [
            ...suggestedBooks,
            ...categoryBooks.map((b) => ({
              ...b,
              suggestionType: "category_based",
            })),
          ];
        }
      }
    }

    // popular fallback
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

      suggestedBooks = [
        ...suggestedBooks,
        ...popularBooks.map((b) => ({ ...b, suggestionType: "popular" })),
      ];
    }

    res.json({ success: true, data: suggestedBooks });
  } catch (err) {
    console.error("getSuggestions error:", err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/tracking/trending ───────────────────────────────────────────────
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
      { $group: { _id: "$book", viewCount: { $sum: 1 } } },
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
    console.error("getTrending error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
