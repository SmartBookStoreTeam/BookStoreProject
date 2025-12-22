import Carousel from "./Carousel";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getBooks } from "../api/booksApi";
import { useCart } from "../hooks/useCart";
import Loading from "./loading";

// Mock books as fallback
const mockBooks = [
  {
    id: 1,
    img: assets.book1,
    title: "Cooking Made Easy",
    author: "Emily Clark",
    rate: 4,
    desc: "Simple and delicious recipes for everyday cooking",
    price: 9.99,
    category: "cooking",
  },
  {
    id: 2,
    img: assets.book2,
    title: "Healthy Living",
    author: "John Miller",
    rate: 5,
    desc: "Your guide to nutritious meals and balanced life",
    price: 12.99,
    category: "health",
  },
  {
    id: 3,
    img: assets.book3,
    title: "Creative Baking",
    author: "Sarah Jones",
    rate: 3,
    desc: "Fun and easy recipes for baking enthusiasts",
    price: 7.49,
    category: "baking",
  },
  {
    id: 4,
    img: assets.book4,
    title: "Everyday Desserts",
    author: "Mark Lee",
    rate: 4,
    desc: "Quick and tasty desserts for everyone",
    price: 10.99,
    category: "desserts",
  },
  {
    id: 5,
    img: assets.releaseBook1,
    title: "Italian Cuisine Masterclass",
    author: "Marco Romano",
    rate: 5,
    desc: "Authentic Italian recipes from traditional kitchens",
    price: 15.99,
    category: "cooking",
  },
  {
    id: 6,
    img: assets.releaseBook2,
    title: "Vegan Delights",
    author: "Lisa Green",
    rate: 4,
    desc: "Plant-based recipes for healthy living",
    price: 11.49,
    category: "health",
  },
  {
    id: 7,
    img: assets.releaseBook3,
    title: "Artisan Bread Making",
    author: "Robert Baker",
    rate: 4,
    desc: "Master the art of bread making at home",
    price: 8.99,
    category: "baking",
  },
  {
    id: 8,
    img: assets.book1,
    title: "Quick Weeknight Meals",
    author: "Jennifer Cook",
    rate: 3,
    desc: "Fast and delicious meals for busy weeknights",
    price: 6.99,
    category: "cooking",
  },
  {
    id: 9,
    img: assets.book2,
    title: "Mediterranean Diet",
    author: "Maria Santos",
    rate: 5,
    desc: "Healthy Mediterranean recipes for longevity",
    price: 13.99,
    category: "health",
  },
  {
    id: 10,
    img: assets.book3,
    title: "French Pastries",
    author: "Pierre Dubois",
    rate: 4,
    desc: "Classic French pastry techniques made easy",
    price: 14.99,
    category: "baking",
  },
  {
    id: 11,
    img: assets.book4,
    title: "Chocolate Heaven",
    author: "Anna Sweet",
    rate: 5,
    desc: "Decadent chocolate recipes for every occasion",
    price: 12.49,
    category: "desserts",
  },
  {
    id: 12,
    img: assets.releaseBook1,
    title: "Asian Street Food",
    author: "Kenji Yamamoto",
    rate: 4,
    desc: "Authentic Asian street food recipes",
    price: 11.99,
    category: "cooking",
  },
];

const Releases = () => {
  const { t } = useTranslation();
  const { userBooks } = useCart();
  const [apiBooks, setApiBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get image source for UserBooks
  const getImageSrc = (image) => {
    if (!image) return null;
    if (image.base64) {
      return image.base64;
    } else if (image.preview) {
      return image.preview;
    } else if (image.url) {
      return image.url;
    }
    return null;
  };

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const books = await getBooks();
        if (books && (books.books || books.length > 0)) {
          const booksData = books.books || books;
          setApiBooks(booksData);
        } else {
          setApiBooks(mockBooks);
        }
      } catch (error) {
        console.error(t("Error fetching books:"), error);
        setApiBooks(mockBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [t]);

  // Combine API books with user books
  const storeBooks =
    Array.isArray(apiBooks) && apiBooks.length > 0 ? apiBooks : mockBooks;
  const safeUserBooks = Array.isArray(userBooks) ? userBooks : [];

  const allBooks = [
    ...storeBooks.map((book) => ({ ...book, type: "regular" })),
    ...safeUserBooks.map((book) => {
      // Add proper image handling for user books
      const imageSrc =
        book.images && book.images.length > 0
          ? getImageSrc(book.images[0])
          : null;
      return {
        ...book,
        type: "user",
        img: imageSrc || book.img,
      };
    }),
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8">
      <div className="container mx-auto px-6 md:px-20 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t("New Releases")}
        </h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        ) : (
          <Carousel books={allBooks} />
        )}
      </div>
    </div>
  );
};

export default Releases;
