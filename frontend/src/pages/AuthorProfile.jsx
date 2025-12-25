import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, Star, User, ArrowLeft, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import { getBooks } from "../api/booksApi";
import Loading from "../components/loading";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const AuthorProfile = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addToCart, userBooks } = useCart();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      try {
        setLoading(true);

        // Fetch books from API
        const response = await getBooks();
        const apiBooks = response.books || response || [];

        // Filter API books by author name
        const filteredApiBooks = apiBooks.filter(
          (book) =>
            book.author?.toLowerCase() ===
            decodeURIComponent(name).toLowerCase()
        );

        // Filter userBooks by author name
        const filteredUserBooks = userBooks.filter(
          (book) =>
            book.author?.toLowerCase() ===
            decodeURIComponent(name).toLowerCase()
        );

        // Combine both sources
        setAuthorBooks([...filteredApiBooks, ...filteredUserBooks]);
      } catch (error) {
        console.error("Error fetching author books:", error);
        setAuthorBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchAuthorBooks();
    }
  }, [name, userBooks]);

  const handleAddToCart = (book) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToCart(book);
    toast.success(`${t("Added")} "${book.title}" ${t("to Cart")}!`, {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
        direction: i18n.dir(),
      },
    });
  };

  // Helper function to get image source
  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (typeof image === "object") {
      if (image.base64) return image.base64;
      if (image.preview) return image.preview;
      if (image.url) return image.url;
    }
    return null;
  };

  if (loading) {
    return <Loading Loading="Loading author books..." height="min-h-screen" />;
  }

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("Go Back")}
          </button>

          {/* Author Header */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                  {decodeURIComponent(name)}
                </h1>
                <p
                  dir="auto"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {authorBooks.length > 2
                    ? `${authorBooks.length} ${t("books available")}`
                    : `${authorBooks.length} ${t("book available")}`}
                </p>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          {authorBooks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {t("No books found for this author.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {authorBooks.map((book, index) => {
                const bookImage =
                  getImageSrc(book.images?.[0]) ||
                  book.image ||
                  book.img ||
                  "/placeholder-book.jpg";

                return (
                  <div
                    key={book._id || book.id || index}
                    className="w-full bg-indigo-50 dark:bg-zinc-800 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md dark:hover:shadow-zinc-700/50 transition-all duration-300"
                  >
                    {/* Book Image */}
                    <Link
                      to={`/book/${book._id || book.id}`}
                      className="relative w-full block cursor-pointer group overflow-hidden rounded-2xl"
                    >
                      <motion.img
                        className="w-full h-[300px] sm:h-[250px] lg:h-[300px] object-cover"
                        src={bookImage}
                        alt={book.title}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                      <span className="absolute text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 left-2 bottom-2 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800 z-10 pointer-events-none">
                        ₹{book.price}
                      </span>
                    </Link>

                    {/* Book Info */}
                    <Link
                      to={`/book/${book._id || book.id}`}
                      className="text-[15px] font-bold mt-3 dark:text-gray-200 mb-1 text-center line-clamp-1 text-gray-700 hover:text-indigo-500 dark:hover:text-indigo-200 focus:text-indigo-500 dark:focus:text-indigo-200 hover:underline focus:underline transition-colors cursor-pointer"
                    >
                      {book.title}
                    </Link>

                    <div className="flex justify-center items-center mb-2 space-x-1">
                      <Link
                        to={`/author/${encodeURIComponent(book.author)}`}
                        className="text-xs text-indigo-400 dark:text-indigo-300 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-200 hover:underline transition-colors duration-300 cursor-pointer"
                      >
                        {book.author}
                      </Link>
                      <span className="text-xs text-indigo-400 dark:text-indigo-300">
                        •
                      </span>

                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < (book.rate || book.rating || 0)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-indigo-200 fill-indigo-200"
                            } transition-colors duration-300`}
                          />
                        ))}
                      </div>
                    </div>

                    <p dir="auto" className="text-xs text-center truncate max-w-[200px] text-gray-700 dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-300">
                      {book.desc ||
                        book.description ||
                        "No description available"}
                    </p>

                    {/* Add to Cart and Details Buttons */}
                    <div className="mt-auto w-full flex gap-2 sm:flex-col lg:flex-row">
                      <Link
                        to={`/book/${book._id || book.id}`}
                        className="flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm"
                      >
                        {t("Details")}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                        className="flex-1 cursor-pointer bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white font-medium px-2 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs whitespace-nowrap">
                          {t("Add to Cart")}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorProfile;
