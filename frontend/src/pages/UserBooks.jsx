import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Trash2, ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import { FaCartPlus } from "react-icons/fa";

const UserBooks = () => {
  const { userBooks, removeUserBook, addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
        maxWidth: "90vw",
        minWidth: "320px",
        padding: "12px",
        textAlign: "center",
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

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <div className="min-h-screen bg-gray-50 pt-20 dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
              {t("Community Books")}
            </h1>
            <span className="text-gray-600 dark:text-gray-400">
              {userBooks.length} {t("books listed")}
            </span>
          </div>

          {userBooks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg">
              <p
                dir={i18n.dir()}
                className="text-gray-500 dark:text-gray-400 text-lg mb-4"
              >
                {t("No books listed yet.")}
              </p>
              <p dir={i18n.dir()} className="text-gray-400 dark:text-gray-500">
                {t("Be the first to list a book!")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userBooks.map((book, index) => {
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
                      className="touch-area relative w-full block cursor-pointer group"
                    >
                      <img
                        className="rounded-2xl w-full h-[300px] sm:h-[250px] lg:h-[300px] object-cover group-hover:opacity-90 transition-opacity"
                        src={bookImage}
                        alt={book.title}
                      />
                      <span className="absolute text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 left-2 bottom-2 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800">
                        ₹{book.price}
                      </span>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeUserBook(book.id);
                        }}
                        className="touch-area absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition-colors cursor-pointer"
                        title={t("Remove book")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </Link>

                    {/* Book Info */}
                    <Link
                      to={`/book/${book._id || book.id}`}
                      className="touch-area text-[15px] font-bold mt-3 dark:text-gray-200 mb-1 text-center line-clamp-1 text-gray-700 hover:text-indigo-500 dark:hover:text-indigo-200 focus:text-indigo-500 dark:focus:text-indigo-200 hover:underline focus:underline transition-colors cursor-pointer"
                    >
                      {book.title}
                    </Link>

                    <div className="flex justify-center items-center mb-2 space-x-1">
                      <Link
                        to={`/author/${encodeURIComponent(book.author)}`}
                        className="touch-area text-xs text-indigo-400 dark:text-indigo-300 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-200 hover:underline transition-colors duration-300 cursor-pointer"
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

                    <p
                      dir="auto"
                      className="touch-area text-xs text-center truncate max-w-[250px] text-gray-700 dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-300"
                    >
                      {book.desc ||
                        book.description ||
                        "No description available"}
                    </p>

                    {/* Add to Cart and Details Buttons */}
                    <div className="mt-auto mb-2 w-full flex gap-2 sm:flex-col lg:flex-row">
                      <Link
                        to={`/book/${book._id || book.id}`}
                        className="touch-area flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm"
                      >
                        {t("Details")}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                        className="touch-area flex-1 cursor-pointer bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white font-medium px-2 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                      >
                        <FaCartPlus className="w-4 h-4" />
                        <span className="text-xs whitespace-nowrap">
                          {t("Add to Cart")}
                        </span>
                      </button>
                    </div>
                    {/* Listed Date */}
                    {book.listedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {new Date(book.listedAt).toLocaleDateString()}
                      </div>
                    )}
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

export default UserBooks;
