import api from "./api.jsx";

const normalizeBook = (b) => {
  const rating =
    typeof b.ratingAvg === "number"
      ? b.ratingAvg
      : typeof b.ratings === "number"
        ? b.ratings
        : typeof b.rate === "number"
          ? b.rate
          : typeof b.rating === "number"
            ? b.rating
            : 0;

  const numReviews =
    typeof b.ratingCount === "number"
      ? b.ratingCount
      : typeof b.numReviews === "number"
        ? b.numReviews
        : Array.isArray(b.reviews)
          ? b.reviews.length
          : 0;

  return {
    ...b,
    _id: b._id || b.id,
    id: b._id || b.id,
    desc: b.desc || b.description || "",
    description: b.description || b.desc || "",
    ratings: rating,
    numReviews,
  };
};

// Get similar books by bookId (used in BookDetails page)
export const getSimilarBooks = async (bookId, limit = 5) => {
  try {
    const res = await api.get(`/recommendations/similar/${bookId}`, {
      params: { limit },
    });
    const payload = res.data;
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ...payload,
      data: list.map(normalizeBook),
    };
  } catch (error) {
    console.error("API Error in getSimilarBooks:", error);
    return { success: false, data: [] };
  }
};

// Get recommendations by text query
export const getRecommendations = async (params = {}) => {
  try {
    const res = await api.get("/recommendations", { params });
    const payload = res.data;
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ...payload,
      data: list.map(normalizeBook),
    };
  } catch (error) {
    console.error("API Error in getRecommendations:", error);
    return { success: false, data: [] };
  }
};
