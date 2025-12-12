// // Get all books
// export const getBooks = async () => {
//   const res = await api.get("/books");
//   return res.data;
// };
import axios from "axios";
import { assets } from "../assets/assets";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Mock data
const mockBooks = [
  {
    _id: "1",
    title: "Cooking Made Easy",
    author: "Emily Clark",
    price: 9.99,
    category: "cooking",
    rate: 4,
    desc: "Simple and delicious recipes for everyday cooking",
    images:[assets.book1],
    isbn: "978-1234567890",
    pages: 250,
    publicationYear: 2023,
  },
  {
    _id: "2",
    title: "Healthy Living",
    author: "John Miller",
    price: 12.99,
    category: "health",
    rate: 5,
    desc: "Your guide to nutritious meals and balanced life",
    images:[assets.book2],
    isbn: "978-1234567891",
    pages: 300,
    publicationYear: 2023,
  },
  {
    _id: "3",
    title: "Creative Baking",
    author: "Sarah Jones",
    price: 7.49,
    category: "baking",
    rate: 3,
    desc: "Fun and easy recipes for baking enthusiasts",
    images:[assets.book3],
    isbn: "978-1234567892",
    pages: 200,
    publicationYear: 2022,
  },
  {
    _id: "4",
    title: "Everyday Desserts",
    author: "Mark Lee",
    price: 10.99,
    category: "desserts",
    rate: 4,
    desc: "Quick and tasty desserts for everyone",
    images:[assets.book4],
    isbn: "978-1234567893",
    pages: 180,
    publicationYear: 2023,
  },
  {
    _id: "5",
    title: "Italian Cuisine Masterclass",
    author: "Marco Romano",
    price: 15.99,
    category: "cooking",
    rate: 5,
    desc: "Authentic Italian recipes from traditional kitchens",
    images:[assets.releaseBook1],
    isbn: "978-1234567894",
    pages: 350,
    publicationYear: 2024,
  },
  {
    _id: "6",
    title: "Vegan Delights",
    author: "Lisa Green",
    price: 11.49,
    category: "health",
    rate: 4,
    desc: "Plant-based recipes for healthy living",
    images:[assets.releaseBook2],
    isbn: "978-1234567895",
    pages: 280,
    publicationYear: 2023,
  },
  {
    _id: "7",
    title: "Artisan Bread Making",
    author: "Robert Baker",
    price: 8.99,
    category: "baking",
    rate: 4,
    desc: "Master the art of bread making at home",
    images:[assets.releaseBook3],
    isbn: "978-1234567896",
    pages: 220,
    publicationYear: 2022,
  },
  {
    _id: "8",
    title: "Quick Weeknight Meals",
    author: "Jennifer Cook",
    price: 6.99,
    category: "cooking",
    rate: 3,
    desc: "Fast and delicious meals for busy weeknights",
    images:[assets.book1],
    isbn: "978-1234567897",
    pages: 190,
    publicationYear: 2023,
  },
];

// Get all books
export const getBooks = async () => {
  try {
    const res = await api.get("/books");
    return res.data;
  } catch (error) {
    console.error("API Error, using mock data:", error);
    // Return mock data as fallback
    return mockBooks;
  }
};

// Get single book by ID
export const getBookById = async (id) => {
  try {
    const res = await api.get(`/books/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error, using mock data:", error);
    // Return mock book as fallback
    const mockBook = mockBooks.find((book) => book._id === id || book.id === id);
    if (mockBook) {
      return mockBook;
    }
    throw new Error("Book not found");
  }
};