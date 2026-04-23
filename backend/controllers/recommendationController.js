import Book from "../models/Book.js";
import { generateEmbedding } from "../utils/embeddingService.js";

// GET /api/recommendations?query=...&genre=...&limit=5
export const getRecommendations = async (req, res) => {
  try {
    const { query, genre, limit = 5 } = req.query;

    const queryEmbedding = await generateEmbedding(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: "Recommendtion", // ← exact name from Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: parseInt(limit),
          ...(genre && { filter: { genre } }),
        },
      },
      {
        $project: { embedding: 0 },
      },
      {
        $addFields: { score: { $meta: "vectorSearchScore" } },
      },
    ];

    const data = await Book.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    console.error("getRecommendations error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/recommendations/similar/:bookId
export const getSimilarBooks = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book)
      return res.status(404).json({ success: false, error: "Book not found" });

    if (!book.embedding || book.embedding.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Book has no embedding yet" });
    }

    const { limit = 5 } = req.query;

    const pipeline = [
      {
        $vectorSearch: {
          index: "Recommendtion", // ← exact name from Atlas
          path: "embedding",
          queryVector: book.embedding,
          numCandidates: 50,
          limit: parseInt(limit) + 1,
        },
      },
      {
        $match: { _id: { $ne: book._id } },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: { embedding: 0 },
      },
      {
        $addFields: { score: { $meta: "vectorSearchScore" } },
      },
    ];

    const data = await Book.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) {
    console.error("getSimilarBooks error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
