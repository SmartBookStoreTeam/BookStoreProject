import api from "./api";
import { assets } from "../assets/assets";

// Mock data (موحّد مع شكل الباك)
const mockBooks = [
  {
    _id: "1",
    title: "Cooking Made Easy",
    author: "Emily Clark",
    price: 9.99,
    category: "cooking",
    description: "Simple and delicious recipes for everyday cooking",
    image: assets.book1,
    ratings: 4,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "2",
    title: "Healthy Living",
    author: "John Miller",
    price: 12.99,
    category: "health",
    description: "Your guide to nutritious meals and balanced life",
    image: assets.book2,
    ratings: 5,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "3",
    title: "Creative Baking",
    author: "Sarah Jones",
    price: 7.49,
    category: "baking",
    description: "Fun and easy recipes for baking enthusiasts",
    image: assets.book3,
    ratings: 3,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "4",
    title: "Everyday Desserts",
    author: "Mark Lee",
    price: 10.99,
    category: "desserts",
    description: "Quick and tasty desserts for everyone",
    image: assets.book4,
    ratings: 4,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "5",
    title: "Italian Cuisine Masterclass",
    author: "Marco Romano",
    price: 15.99,
    category: "cooking",
    description: "Authentic Italian recipes from traditional kitchens",
    image: assets.releaseBook1,
    ratings: 5,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "6",
    title: "Vegan Delights",
    author: "Lisa Green",
    price: 11.49,
    category: "health",
    description: "Plant-based recipes for healthy living",
    image: assets.releaseBook2,
    ratings: 4,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "7",
    title: "Artisan Bread Making",
    author: "Robert Baker",
    price: 8.99,
    category: "baking",
    description: "Master the art of bread making at home",
    image: assets.releaseBook3,
    ratings: 4,
    numReviews: 0,
    isActive: true,
  },
  {
    _id: "8",
    title: "Quick Weeknight Meals",
    author: "Jennifer Cook",
    price: 6.99,
    category: "cooking",
    description: "Fast and delicious meals for busy weeknights",
    image: assets.book1,
    ratings: 3,
    numReviews: 0,
    isActive: true,
  },
];

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
    console.error("API Error, using mock data:", error);

    return {
      success: true,
      data: mockBooks.map(normalizeBook),
      meta: {
        page: 1,
        pageSize: mockBooks.length,
        total: mockBooks.length,
        pages: 1,
      },
      fallback: true,
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
    return {
      success: true,
      data: mockBooks.map(normalizeBook),
      meta: {
        page: 1,
        pageSize: mockBooks.length,
        total: mockBooks.length,
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
    console.error("API Error, using mock data:", error);

    const mockBook = mockBooks.find((b) => (b._id || b.id) === id);
    if (!mockBook) throw new Error("Book not found");

    return {
      success: true,
      data: normalizeBook(mockBook),
      fallback: true,
    };
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
    // Fallback to mock data sorted by rating
    const sortedMock = [...mockBooks].sort((a, b) => b.ratings - a.ratings).slice(0, limit);
    return {
      success: true,
      data: sortedMock.map(normalizeBook),
      fallback: true,
    };
  }
};
