import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/loading";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";
import AuthModal from "./AuthModal";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  BookOpen,
  User,
  Tag,
  Calendar,
  FileText,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getBookById } from "../api/booksApi";
import toast from "react-hot-toast";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, userBooks } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to fetch from API
        try {
          const bookData = await getBookById(id);
          if (bookData) {
            setBook(bookData);
            return;
          }
        } catch {
          console.log("Book not found in API, checking local books...");
        }

        // Fallback: Check in userBooks (local data)
        const localBook = userBooks.find(
          (b) => b.id === id || b._id === id || b.id === parseInt(id)
        );

        if (localBook) {
          setBook(localBook);
        } else {
          setError(t("Book not found"));
        }
      } catch (error) {
        setError(
          error.response?.data?.message || t("Failed to fetch book details")
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBook();
    }
  }, [id, t, userBooks]);
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
        direction: `${i18n.dir()}`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center dark:bg-zinc-900 py-20">
        <div className="text-center">
          <Loading />
          <p dir={i18n.dir()} className="text-gray-600 dark:text-gray-200 mt-2">
            {t("Loading book details...")}
          </p>
        </div>
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="pt-20 flex items-center justify-center dark:bg-zinc-900 py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">
            {t("Something went wrong")}
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-6">
            {error ||
              t(
                "error",
                "We're sorry, but we couldn't load the book details. Please try again later."
              )}
          </p>
          <button
            className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(-1)}
          >
            {t("Go Back")}
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get image source for UserBooks (same as Shop.jsx)
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

  //Image Source
  const bookImage =
    book.img ||
    book.image ||
    (book.images && book.images.length > 0
      ? getImageSrc(book.images[0]) || book.images[0]
      : null) ||
    assets.placeholderBook;
  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <div className="min-h-screen bg-gray-50 pt-2 dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          {/* Back Button */}
          <button
            onClick={() => navigate("/shop")}
            className="md:hidden flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-7 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("Back to Shop")}
          </button>
          {/* Book Details */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-[#1a1a22]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Book Image */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md aspect-3/4 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={bookImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Additional Images if available */}
                {book.images && book.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4 w-full max-w-md">
                    {book.images.slice(1, 5).map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      >
                        <img
                          src={img.preview || img}
                          alt={`${book.title} ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex flex-col  sm:p-12">
                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-gray-200">
                  {book.title}
                </h1>

                {/* Author */}
                <div className="flex items-center text-xl text-gray-700 mb-4 dark:text-gray-200">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">{book.author}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      return (
                        <Star
                          key={i}
                          size={20}
                          className={`cursor-pointer transition-all
            ${
              value <=
              (book.hoverRating || book.rate || book.userRating || book.ratings)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-300"
            }
            hover:text-yellow-400 hover:fill-yellow-400
          `}
                          onMouseEnter={() =>
                            setBook({ ...book, hoverRating: value })
                          }
                          onMouseLeave={() =>
                            setBook({ ...book, hoverRating: 0 })
                          }
                          onClick={() =>
                            setBook({ ...book, userRating: value })
                          }
                        />
                      );
                    })}
                  </div>
                  <span className="text-gray-600 font-medium dark:text-gray-300">
                    ({book.userRating || book.ratings || book.rate || 0} / 5)
                  </span>
                </div>
                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">
                    ₹{book.price}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-xl text-gray-400 line-through ml-3">
                      ₹{book.originalPrice}
                    </span>
                  )}
                </div>
                {/* Category and Condition */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                    <Tag className="w-4 h-4 mr-1" />
                    {t(book.category)}
                  </span>
                </div>

                {/* Description */}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center dark:text-gray-300">
                    <FileText className="w-5 h-5 mr-2 dark:text-gray-300" />
                    {t("Description")}
                  </h3>
                  <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                    {book.description || book.desc}
                  </p>
                </div>

                {/* Additional Details */}
                <div className="grid sm:grid-cols-3  gap-4 mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  {book.isbn && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-200">
                        ISBN:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis hover:whitespace-normal hover:overflow-visible hover:text-gray-900 dark:hover:text-gray-200">
                        {book.isbn}
                      </p>
                    </div>
                  )}
                  {book.edition && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-200">
                        {t("Edition")}:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {book.edition}
                      </p>
                    </div>
                  )}
                  {book.publicationYear && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-200">
                        {t("Year")}:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {book.publicationYear}
                      </p>
                    </div>
                  )}
                  {book.pages && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-200">
                        {t("Pages")}:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {book.pages}
                      </p>
                    </div>
                  )}
                </div>

                {/* Seller Info (for user books) */}
                {book.sellerName && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {t("Publisher Information")}
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {book.sellerName}
                    </p>
                    {book.sellerLocation && (
                      <p className="text-sm text-gray-600">
                        {book.sellerLocation}
                      </p>
                    )}
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(book);
                  }}
                  className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-colors ${"bg-gray-900 hover:bg-gray-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer"}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("Add to Cart")}
                </button>

                {/* Quick Actions */}
                <div className="mt-4 flex gap-3 flex-col lg:flex-row">
                  <Link
                    to="/shop"
                    className="flex-1 text-center py-2 border-2 border-gray-300 rounded-lg hover:bg-zinc-200 hover:border-gray-400 transition-colors text-gray-700 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium"
                  >
                    {t("Continue Shopping")}
                  </Link>
                  <Link
                    to="/cart"
                    className="flex-1 text-center py-2 border-2 border-indigo-600 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-indigo-600 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium"
                  >
                    {t("View Cart")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetails;
