import api from "./api";


const normalizeBook = (b) => {
  const rating =
    typeof b.ratings === "number"
      ? b.ratings
      : typeof b.ratingAvg === "number"
        ? b.ratingAvg
        : typeof b.rate === "number"
          ? b.rate
          : typeof b.rating === "number"
            ? b.rating
            : 0;

  const numReviews =
    typeof b.numReviews === "number"
      ? b.numReviews
      : typeof b.ratingCount === "number"
        ? b.ratingCount
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

// Get all books (يدعم params زي الباك)
export const getBooks = async (params = {}) => {
  try {
    const res = await api.get("/books", { params });
    const payload = res.data; // { success, data, meta }

    const list = Array.isArray(payload?.data) ? payload.data : [];
    const normalized = list.map(normalizeBook);

    return {
      ...payload,
      data: normalized,
    };
  } catch (error) {
    console.error("API Error in getBooks:", error);
    return {
      success: false,
      data: [],
      meta: {
        page: 1,
        pageSize: 0,
        total: 0,
        pages: 1,
      },
    };
  }
};

// Search books (يدعم q + pagination + sort + category)
export const searchBooks = async (params = {}) => {
  try {
    // الباك عندك مستخدم req.query.q
    const res = await api.get("/books/search", { params });
    const payload = res.data; // { success, data, meta }

    const list = Array.isArray(payload?.data) ? payload.data : [];
    const normalized = list.map(normalizeBook);

    return { ...payload, data: normalized };
  } catch (error) {
    console.error("API Error in searchBooks:", error);

    // fallback بسيط: رجّع نفس شكل الباك
    // Return empty results on search error instead of mock data
    return {
      success: false,
      data: [],
      meta: {
        page: 1,
        pageSize: 0,
        total: 0,
        pages: 1,
      },
      fallback: true,
    };
  }
};

// Get single book by ID
export const getBookById = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    // الباك بيرجع { success, data: book }
    return {
      ...res.data,
      data: normalizeBook(res.data?.data),
    };
  } catch (error) {
    console.error("API Error in getBookById:", error);
    throw error;
  }
};

// Get top rated books
export const getTopBooks = async (limit = 10) => {
  try {
    const res = await api.get("/books/top", { params: { limit } });
    const payload = res.data;
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return {
      success: true,
      data: list.map(normalizeBook),
    };
  } catch (error) {
    console.error("API Error in getTopBooks:", error);
    return {
      success: false,
      data: [],
    };
  }
};

// Download book PDF
export const downloadBook = async (bookId) => {
  try {
    const res = await api.get(`/books/${bookId}/download`);
    return res.data; // { success, data: { url, type } }
  } catch (error) {
    console.error("Error downloading book:", error);
    throw error;
  }
};

// Get categories with book counts
export const getCategoryStats = async () => {
  try {
    const res = await api.get("/books/categories/stats");
    return res.data;
  } catch (error) {
    console.error("API Error in getCategoryStats:", error);
    return {
      success: false,
      data: [],
      total: 0,
    };
  }
};
