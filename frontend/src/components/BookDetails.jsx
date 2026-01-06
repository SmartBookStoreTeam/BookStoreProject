import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";
import SkeletonLoading from "./SkeletonLoading";
import Loading from "./Loading";
import AuthModal from "./AuthModal";
import AuthorBooks from "./AuthorBooks";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  BookOpen,
  User,
  Tag,
  FileText,
  Eye,
} from "lucide-react";

import { getBookById } from "../api/booksApi";
import toast from "react-hot-toast";
import { t } from "i18next";
import { useGlobalLoading } from "../context/LoadingContext";

// Helper function to fill missing book data with placeholders
const fillMissingBookData = (book) => {
  if (!book) return null;

  return {
    ...book,
    title: book.title || t("Book title not available"),
    author: book.author || t("Author not available"),
    description:
      book.description ||
      book.desc ||
      t("No description available for this book. Sorry for the inconvenience."),
    price: book.price || 0,
    category: book.category || t("uncategorized"),
    isbn:
      book.isbn ||
      "ISBN-" + Math.random().toString(36).substr(2, 13).toUpperCase(),
    edition: book.edition || t("First Edition"),
    publicationYear: book.publicationYear || new Date().getFullYear(),
    pages: book.pages || 200,
    ratings: book.ratings || book.rate || book.userRating || 4,
  };
};

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, userBooks, cartItems } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("cart"); // 'cart' or 'preview'
  const [isImageHovered, setIsImageHovered] = useState(false);
  const { setIsLoading } = useGlobalLoading();

  // Sync local loading with global loading bar
  useEffect(() => {
    setIsLoading(loading);

    // Cleanup: reset loading when component unmounts
    return () => {
      setIsLoading(false);
    };
  }, [loading, setIsLoading]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to fetch from API
        try {
          const bookData = await getBookById(id);
          if (bookData) {
            setBook(fillMissingBookData(bookData));
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
          setBook(fillMissingBookData(localBook));
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

  // Check if book is already in cart
  const isBookInCart =
    book &&
    cartItems &&
    cartItems.some((item) => {
      return (
        item.id === book.id ||
        item._id === book._id ||
        item.id === book._id ||
        item._id === book.id
      );
    });

  const handleAddToCart = (bookToAdd) => {
    if (!user) {
      setAuthModalMode("cart");
      setShowAuthModal(true);
      return;
    }

    // If book is already in cart, go to checkout
    if (isBookInCart) {
      navigate("/checkout", { state: { books: cartItems } });
      return;
    }

    // Otherwise, add to cart
    const result = addToCart(bookToAdd);
    if (result.success) {
      toast.success(`${t("Added")} "${bookToAdd.title}" ${t("to Cart")}!`, {
        duration: 1500,
        style: {
          background: "#333",
          color: "#fff",
          direction: i18n.dir(),
          width: "fit-content",
          maxWidth: "90vw",
          minWidth: "200px",
          padding: "12px 16px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });
    }
  };
  if (loading) {
    return <SkeletonLoading />;
  }
  if (error || !book) {
    return (
      <div className="pt-20 flex items-center justify-center dark:bg-zinc-900 py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <Loading
            error={t("error", "We are sorry, book not found")}
            height="h-60"
            status="error"
          />

          <button
            className="touch-area bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(-1)}
          >
            {t("Go Back")}
          </button>
        </div>
      </div>
    );
  }

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
        icon={
          authModalMode === "cart" ? (
            <ShoppingCart className=" w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
          ) : (
            <div dir="ltr" className="flex items-center justify-center gap-2">
              <BookOpen className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
              <Eye className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          )
        }
        title={
          authModalMode === "cart"
            ? t("Please login or create an account to add book to your cart")
            : t("Please login or create an account to preview this book")
        }
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <div
        dir={i18n.dir()}
        className="bg-gray-50 dark:bg-zinc-900 overflow-x-hidden"
      >
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            dir="ltr"
            onClick={() => navigate("/shop")}
            className="group touch-area flex md:hidden items-center justify-start mr-auto text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-7 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-all" />
            {t("Back to Shop")}
          </button>
          {/* Book Details */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-[#1a1a22]">
            <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr_340px] gap-6 lg:gap-10 p-8 lg:p-10">
              {/* Book Image */}
              <div className="touch-area flex flex-col items-center lg:items-start order-1">
                <div
                  className="w-full max-w-xs lg:w-72 aspect-3/4 bg-gray-100 rounded-xl overflow-hidden shadow-md relative group"
                  onMouseEnter={() => setIsImageHovered(true)}
                  onMouseLeave={() => setIsImageHovered(false)}
                >
                  <img
                    src={bookImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Hover Overlay - Only show if book has PDF */}
                  {book.pdf && (
                    <div
                      className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 rounded-xl ${
                        isImageHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {user ? (
                        <Link
                          to={`/pdf-viewer/${book._id || book.id}`}
                          className="touch-area px-6 py-3 border border-indigo-400 bg-transparent text-indigo-100 rounded-xl font-semibold text-lg flex items-center gap-2 hover:scale-105 hover:border-indigo-500 hover:text-indigo-300 hover:shadow-lg transition-transform shadow-xl"
                        >
                          <BookOpen className="w-5 h-5" />
                          {t("Preview Book")}
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setAuthModalMode("preview");
                            setShowAuthModal(true);
                          }}
                          className="touch-area px-6 py-3 bg-white dark:bg-indigo-600 text-gray-900 dark:text-white rounded-xl font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-xl cursor-pointer"
                        >
                          <BookOpen className="w-5 h-5" />
                          {t("Preview Book")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Images if available */}
                {book.images && book.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4 w-full max-w-xs lg:w-72">
                    {book.images.slice(1, 5).map((img, index) => {
                      const imgSrc =
                        getImageSrc(img) || img || assets.placeholderBook;
                      return (
                        <div
                          key={index}
                          className="touch-area aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <img
                            src={imgSrc}
                            alt={`${book.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex flex-col order-2">
                {/* Title */}
                <h1
                  dir="auto"
                  className="touch-area text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-200"
                >
                  {book.title}
                </h1>

                {/* Author */}
                <Link
                  to={`/author/${encodeURIComponent(book.author)}`}
                  className="touch-area flex items-center text-lg md:text-xl text-gray-700 mb-4 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer group w-fit"
                >
                  <User className="w-5 h-5 mr-2 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                  <span dir="auto" className="font-medium hover:underline">
                    {book.author}
                  </span>
                </Link>

                {/* Rating */}
                <div className="touch-area flex items-center gap-2 mb-6">
                  <div dir="ltr" className="flex">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      return (
                        <Star
                          key={i}
                          size={20}
                          className={`touch-area cursor-pointer transition-all ${
                            value <=
                            (book.hoverRating ||
                              book.rate ||
                              book.userRating ||
                              book.ratings)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          } hover:text-yellow-400 hover:fill-yellow-400`}
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
                  <span className="touch-area text-gray-600 font-medium dark:text-gray-300">
                    ({book.userRating || book.ratings || book.rate || 0} / 5)
                  </span>
                </div>
                {/* Price Card */}
                <div className="touch-area my-4 md:hidden p-4 lg:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700">
                  <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                    {book.price} {t("EGP")}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-lg text-gray-400 line-through ml-3 lg:block lg:mt-1">
                      {book.originalPrice} {t("EGP")}
                    </span>
                  )}
                </div>
                {/* Category */}
                <div className="touch-area flex flex-wrap gap-3 mb-6">
                  <span
                    className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                      book.category === "uncategorized"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        : "bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-gray-200"
                    }`}
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {t(
                      book.category?.charAt(0).toUpperCase() +
                        book.category?.slice(1)
                    )}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center dark:text-gray-300">
                    <FileText className="w-5 h-5 mr-2 dark:text-gray-300" />
                    {t("Description")}
                  </h3>
                  <div className="pr-2">
                    <p
                      dir="auto"
                      className="text-gray-700 leading-relaxed dark:text-gray-300"
                    >
                      {book.description || book.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Actions*/}
              <div className="flex flex-col space-y-4 order-3 lg:w-full">
                {/* Price Card */}
                <div className="hidden md:block p-4 lg:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700">
                  <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                    {book.price} {t("EGP")}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-lg text-gray-400 line-through ml-3 lg:block lg:mt-1">
                      {book.originalPrice} {t("EGP")}
                    </span>
                  )}
                </div>

                {/* Preview Book Link */}
                {book.pdf && (
                  <div className="touch-area text-left">
                    {user ? (
                      <Link
                        to={`/pdf-viewer/${book._id || book.id}`}
                        className="touch-area inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-base font-semibold transition-colors cursor-pointer hover:underline"
                      >
                        <BookOpen className="w-5 h-5" />
                        {t("Preview Book")}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setAuthModalMode("preview");
                          setShowAuthModal(true);
                        }}
                        className="touch-area inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-400 text-base font-semibold transition-colors cursor-pointer hover:underline"
                      >
                        <BookOpen className="w-5 h-5" />
                        {t("Preview Book")}
                      </button>
                    )}
                  </div>
                )}

                {/* Add to Cart / Go to Checkout Button */}
                <button
                  dir="ltr"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(book);
                  }}
                  className="touch-area w-full px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all bg-gray-900 hover:bg-gray-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  {isBookInCart ? (
                    <>
                      <FaShoppingCart className="w-6 h-6" />
                      {t("Go to Checkout")}
                    </>
                  ) : (
                    <>
                      <FaCartPlus className="w-6 h-6" />
                      {t("Add to Cart")}
                    </>
                  )}
                </button>

                {/* Secondary Actions */}
                <div
                  dir={i18n.dir()}
                  className="grid grid-cols-1 lg:grid-cols-1 gap-3"
                >
                  <Link
                    to="/shop"
                    className="touch-area hidden md:block w-full text-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-gray-700 dark:text-gray-200 font-medium block"
                  >
                    {t("Continue Shopping")}
                  </Link>
                  <Link
                    dir="ltr"
                    to="/cart"
                    className="touch-area flex items-center justify-center gap-2 w-full text-center px-6 py-4 border-2 border-indigo-600 dark:border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-indigo-600 dark:text-indigo-300 font-medium block"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {t("View Cart")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Details*/}
            <div dir={i18n.dir()} className="px-8 lg:px-10 pb-8 lg:pb-10">
              <h3 className="touch-area text-lg font-semibold text-gray-900 mb-4 dark:text-gray-300">
                {t("Additional Details")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
                <div>
                  <span className="touch-area text-sm text-gray-600 dark:text-gray-200">
                    ISBN:
                  </span>
                  <p
                    className="touch-area font-medium text-gray-900 dark:text-gray-200 text-sm break-words"
                    title={book.isbn}
                  >
                    {book.isbn}
                  </p>
                </div>
                <div>
                  <span className="touch-area text-sm text-gray-600 dark:text-gray-200">
                    {t("Edition")}:
                  </span>
                  <p className="touch-area font-medium text-gray-900 dark:text-gray-200">
                    {book.edition}
                  </p>
                </div>
                <div>
                  <span className="touch-area text-sm text-gray-600 dark:text-gray-200">
                    {t("Year")}:
                  </span>
                  <p className="touch-area font-medium text-gray-900 dark:text-gray-200">
                    {book.publicationYear}
                  </p>
                </div>
                <div>
                  <span className="touch-area text-sm text-gray-600 dark:text-gray-200">
                    {t("Pages")}:
                  </span>
                  <p className="touch-area font-medium text-gray-900 dark:text-gray-200">
                    {book.pages}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author Books Section */}
      {book && book.author && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AuthorBooks
            authorName={book.author}
            excludeBookId={book._id || book.id}
          />
        </div>
      )}
    </>
  );
};

export default BookDetails;
