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
import { getMyOrders } from "../api/ordersApi";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import { useTrackView } from "../hooks/useTracking";

import {
  Star,
  ShoppingCart,
  ArrowLeft,
  BookOpen,
  User,
  Tag,
  FileText,
  Eye,
  Languages,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

import { getBookById } from "../api/booksApi";
import api from "../api/api";
import toast from "react-hot-toast";
import { useGlobalLoading } from "../context/LoadingContext";
import { getImageSrc } from "../utils/imageUtils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

// helpers
// Returns array of category name strings
const getCategoryNames = (book, t) => {
  // New format: categories array
  if (Array.isArray(book?.categories) && book.categories.length > 0) {
    return book.categories.map((c) => {
      if (!c) return t("uncategorized");
      if (typeof c === "string") return c;
      return c?.name || t("uncategorized");
    });
  }
  // Old format: single category field
  if (book?.category) {
    const c = book.category;
    if (typeof c === "string") return [c];
    return [c?.name || t("uncategorized")];
  }
  return [t("uncategorized")];
};

const isArabic = (text) => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

const fillMissingBookData = (book, t, actualPages = null) => {
  if (!book) return null;

  const categoryNames = getCategoryNames(book, t);

  return {
    ...book,
    _id: book._id || book.id,
    id: book._id || book.id,

    title: book.title || "Book title not available",
    author: book.author || "Author not available",
    description:
      book.description ||
      book.desc ||
      "No description available for this book. Sorry for the inconvenience.",

    price:
      typeof book.price === "number" ? book.price : Number(book.price || 0),

    categories: book.categories || (book.category ? [book.category] : []),
    categoryNames,

    isbn: book.isbn || "Unavailable",
    edition: book.edition || "Unavailable",
    year: book.year || "Unavailable",
    pages: actualPages || book.pages || "Unavailable",

    // ratings
    ratings:
      typeof book.ratings === "number"
        ? book.ratings
        : typeof book.rate === "number"
          ? book.rate
          : 0,
    numReviews:
      typeof book.numReviews === "number"
        ? book.numReviews
        : Array.isArray(book.reviews)
          ? book.reviews.length
          : 0,
  };
};

const getEditionSuffix = (num) => {
  const n = parseInt(num, 10);
  if (isNaN(n)) return "th";
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const getArabicOrdinal = (num) => {
  const n = parseInt(num);
  const ordinals = {
    1: "الأولى",
    2: "الثانية",
    3: "الثالثة",
    4: "الرابعة",
    5: "الخامسة",
    6: "السادسة",
    7: "السابعة",
    8: "الثامنة",
    9: "التاسعة",
    10: "العاشرة",
  };
  return ordinals[n] || num;
};

const BookDetails = () => {
  const { id } = useParams();
  useTrackView(id);
  const navigate = useNavigate();
  const { addToCart, userBooks, cartItems, isBookPurchased, purchasedBooks } =
    useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("cart"); // 'cart' or 'preview'
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState(null);
  const [translatedDescription, setTranslatedDescription] = useState(null);
  const { setIsLoading } = useGlobalLoading();

  const [isFirstOrder, setIsFirstOrder] = useState(false);

  useEffect(() => {
    setTranslatedTitle(null);
    setTranslatedDescription(null);
  }, [i18n.language]);

  useEffect(() => {
    const checkFirstOrder = async () => {
      if (user) {
        try {
          const res = await getMyOrders();
          const hasOrders = Array.isArray(res) && res.length > 0;
          const hasBooksInLibrary =
            Array.isArray(purchasedBooks) && purchasedBooks.length > 0;
          setIsFirstOrder(!hasOrders && !hasBooksInLibrary);
        } catch {
          setIsFirstOrder(false);
        }
      } else {
        setIsFirstOrder(true);
      }
    };
    checkFirstOrder();
  }, [user, purchasedBooks]);
  const [actualPages, setActualPages] = useState(null);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Sync local loading with global loading bar
  useEffect(() => {
    setIsLoading(loading);
    return () => setIsLoading(false);
  }, [loading, setIsLoading]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // API first
        try {
          const res = await getBookById(id);
          // getBookById  { success, data: book }
          const apiBook = res?.data;
          if (apiBook) {
            setBook(fillMissingBookData(apiBook, t, actualPages));
            return;
          }
        } catch {
          // ignore
        }

        //fallback: local community books
        const localBook = userBooks.find(
          (b) => String(b.id || b._id) === String(id),
        );

        if (localBook) {
          setBook(fillMissingBookData(localBook, t, actualPages));
        } else {
          setError(t("Book not found"));
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || t("Failed to fetch book details"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t, userBooks]);

  // Extract actual page count from PDF
  useEffect(() => {
    const extractPageCount = async () => {
      if (!book?.pdf) return;

      // Check if already extracted
      const bookId = book._id || book.id;
      const savedPages = localStorage.getItem(`book_${bookId}_pages`);
      if (savedPages) {
        setActualPages(parseInt(savedPages));
        setPagesLoading(false);
        return;
      }

      // Start loading
      setPagesLoading(true);

      try {
        // Get PDF URL
        let pdfUrl = null;
        if (book.pdfUrl) {
          pdfUrl = book.pdfUrl;
        } else if (book.pdf) {
          // Try to get preview URL
          try {
            const pdfResponse = await api.get(`/books/${bookId}/preview`);
            if (pdfResponse.data?.success && pdfResponse.data?.data?.url) {
              pdfUrl = pdfResponse.data.data.url;
            }
          } catch {
            pdfUrl = getImageSrc(book.pdf);
          }
        }

        if (!pdfUrl) {
          setPagesLoading(false);
          return;
        }

        // Load PDF and get page count
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        // Save to state and localStorage
        setActualPages(numPages);
        localStorage.setItem(`book_${bookId}_pages`, numPages.toString());
      } catch (error) {
        console.error("Error extracting PDF page count:", error);
      } finally {
        setPagesLoading(false);
      }
    };

    extractPageCount();
  }, [book]);

  // Update book data when actualPages changes
  useEffect(() => {
    if (actualPages && book && book.pages !== actualPages) {
      setBook((prevBook) => fillMissingBookData(prevBook, t, actualPages));
    }
  }, [actualPages, book, t]);

  // Update page title
  useEffect(() => {
    if (book?.title) document.title = `${book.title} : ${t("Bookfly Store")}`;
    return () => {
      document.title = t("Bookfly Store - Buy your favorite books online");
    };
  }, [book, t]);

  const isBookInCart =
    book &&
    cartItems?.some(
      (item) => String(item._id || item.id) === String(book._id || book.id),
    );

  const handleAddToCart = (bookToAdd) => {
    // If book is already in cart, the button acts as "Go to Checkout"
    if (isBookInCart) {
      if (!user) {
        setAuthModalMode("cart");
        setShowAuthModal(true);
        return;
      }
      navigate("/checkout", { state: { books: cartItems } });
      return;
    }

    const result = addToCart(bookToAdd);
    if (result?.success) {
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

  const handleRating = async (value) => {
    if (!user) {
      toast.error(t("Please login to rate books"), {
        duration: 2000,
        style: { background: "#333", color: "#fff", direction: i18n.dir() },
      });
      return;
    }

    try {
      setBook((prev) => ({ ...prev, userRating: value }));

      const response = await api.post(`/books/${id}/rate`, {
        rating: value,
      });

      const payload = response.data;
      const newRatings = payload?.data?.ratings;
      const newNumReviews = payload?.data?.numReviews;

      setBook((prev) => ({
        ...prev,
        userRating: value,
        ratings: typeof newRatings === "number" ? newRatings : prev.ratings,
        numReviews:
          typeof newNumReviews === "number" ? newNumReviews : prev.numReviews,
      }));

      toast.success(t("Thank you for your rating!"), {
        duration: 2000,
        style: { background: "#333", color: "#fff", direction: i18n.dir() },
      });
    } catch (err) {
      console.error("Error submitting rating:", err);

      setBook((prev) => ({ ...prev, userRating: prev?.userRating || 0 }));

      toast.error(
        err?.response?.data?.message || t("Failed to submit rating"),
        {
          duration: 2000,
          style: { background: "#333", color: "#fff", direction: i18n.dir() },
        },
      );
    }
  };

  const handleTranslate = async () => {
    if (translatedTitle && translatedDescription) {
      setTranslatedTitle(null);
      setTranslatedDescription(null);
      return;
    }

    setIsTranslating(true);
    try {
      // If content is Arabic, translate to English. Otherwise, translate to Arabic.
      const targetLang = isArabic(book.title) ? "en" : "ar";

      const translateText = async (text) => {
        if (!text) return "";
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map((item) => item[0]).join("");
      };

      const [titleRes, descRes] = await Promise.all([
        translateText(book.title),
        translateText(book.description || book.desc),
      ]);

      setTranslatedTitle(titleRes);
      setTranslatedDescription(descRes);
    } catch (error) {
      toast.error(t("Translation failed. Please try again."));
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) return <SkeletonLoading />;

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

  const bookImage =
    book.img ||
    book.image ||
    (book.images?.length > 0
      ? getImageSrc(book.images[0]) || book.images[0]
      : null) ||
    assets.placeholderBook;

  const bookId = book._id || book.id;

  return (
    <>
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
          <button
            dir="ltr"
            onClick={() => navigate("/shop")}
            className="group touch-area flex md:hidden items-center justify-start rounded-full mr-auto text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 hover:bg-gray-100 hover:dark:bg-gray-100/10 p-2 mb-7 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-all" />
            {t("Back to Shop")}
          </button>

          <div className="overflow-hidden">
            <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr_340px] gap-6 lg:gap-10 p-2 bg-gray-50 dark:bg-zinc-900 lg:p-10">
              {/* Image */}
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

                  {book.pdf && (
                    <div
                      className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 rounded-xl ${
                        isImageHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Link
                        to={`/pdf-viewer/${bookId}`}
                        className="touch-area px-6 py-3 border border-indigo-400 bg-transparent text-indigo-100 rounded-xl font-semibold text-lg flex items-center gap-2 hover:scale-105 hover:border-indigo-500 hover:text-indigo-300 hover:shadow-lg transition-transform shadow-xl"
                      >
                        <BookOpen className="w-5 h-5" />
                        {isBookPurchased(bookId)
                          ? t("Start Reading")
                          : t("Preview Book")}
                      </Link>
                    </div>
                  )}
                </div>

                {book.images?.length > 1 && (
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

              {/* Info */}
              <div className="flex flex-col order-2">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1
                    dir="auto"
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-200"
                  >
                    {translatedTitle || t(book.title)}
                  </h1>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer shrink-0 border border-indigo-100 dark:border-indigo-800"
                    title={t("Translate")}
                  >
                    <Languages
                      className={`w-4 h-4 ${isTranslating ? "animate-pulse" : "group-hover:rotate-12"}`}
                    />
                    <span
                      dir="auto"
                      className="text-[15px] font-bold uppercase tracking-wider"
                    >
                      {isTranslating
                        ? isArabic(book.title)
                          ? "Translating..."
                          : "جاري الترجمة..."
                        : isArabic(book.title)
                          ? "View Translate"
                          : "عرض الترجمة"}
                    </span>
                  </button>
                </div>

                <Link
                  to={`/author/${encodeURIComponent(book.author)}`}
                  className="touch-area flex items-center text-lg md:text-xl text-gray-700 mb-4 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer group w-fit"
                >
                  <User className="w-5 h-5 mr-2 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                  <span dir="auto" className="font-medium hover:underline">
                    {t(book.author)}
                  </span>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div dir="ltr" className="flex">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const activeValue =
                        book.hoverRating ||
                        book.userRating ||
                        book.ratings ||
                        0;
                      return (
                        <Star
                          key={i}
                          size={20}
                          className={`cursor-pointer transition-all ${
                            value <= activeValue
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          } hover:text-yellow-400 hover:fill-yellow-400`}
                          onMouseEnter={() =>
                            setBook((prev) => ({ ...prev, hoverRating: value }))
                          }
                          onMouseLeave={() =>
                            setBook((prev) => ({ ...prev, hoverRating: 0 }))
                          }
                          onClick={() => handleRating(value)}
                        />
                      );
                    })}
                  </div>

                  <span className="text-gray-600 font-medium dark:text-gray-300">
                    ({(book.ratings || 0).toFixed?.(1) ?? book.ratings} / 5)
                    {book.numReviews > 0 &&
                      ` • ${book.numReviews} ${book.numReviews === 1 ? t("review") : t("reviews")}`}
                  </span>
                </div>

                {/* Price card small */}
                {!isBookPurchased(bookId) && (
                  <div className="my-4 md:hidden p-4 lg:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700">
                    {isFirstOrder ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">
                            {book.price} {t("EGP")}
                          </span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-400">
                            {t("First Order Discount")} (-50%)
                          </span>
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                          {(book.price / 2).toFixed(2)} {t("EGP")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                        {book.price} {t("EGP")}
                      </span>
                    )}
                  </div>
                )}

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(book.categoryNames || [t("uncategorized")]).map(
                    (name, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                          name === t("uncategorized")
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            : "bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-gray-200"
                        }`}
                      >
                        <Tag className="w-4 h-4 mr-1 ml-1" />
                        {t(name)}
                      </span>
                    ),
                  )}
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
                      {translatedDescription || book.description || book.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col space-y-4 order-3 lg:w-full">
                {!isBookPurchased(bookId) && (
                  <div className="hidden md:block p-4 lg:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700">
                    {isFirstOrder ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">
                            {book.price} {t("EGP")}
                          </span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-400">
                            50% {t("Discount")}
                          </span>
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                          {(book.price / 2).toFixed(2)} {t("EGP")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                        {book.price} {t("EGP")}
                      </span>
                    )}
                  </div>
                )}

                {book.pdf && !isBookPurchased(bookId) && (
                  <div dir={i18n.dir()} className="touch-area">
                    <Link
                      to={`/pdf-viewer/${bookId}`}
                      className="touch-area inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-base font-semibold transition-colors cursor-pointer hover:underline"
                    >
                      <BookOpen className="w-5 h-5" />
                      {isBookPurchased(bookId)
                        ? t("Start Reading")
                        : t("Preview Book")}
                    </Link>
                  </div>
                )}

                {isBookPurchased(bookId) ? (
                  book.pdf && (
                    <Link
                      to={`/pdf-viewer/${bookId}`}
                      className="touch-area w-full px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all bg-green-600 hover:bg-green-700 text-white active:scale-95 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <BookOpen className="w-6 h-6" />
                      {t("Start Reading")}
                    </Link>
                  )
                ) : (
                  <button
                    dir="ltr"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(book);
                    }}
                    className="touch-area w-full px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all bg-gray-900 hover:bg-gray-800 text-white active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer shadow-lg hover:shadow-xl"
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
                )}

                <div
                  dir={i18n.dir()}
                  className="grid grid-cols-1 lg:grid-cols-1 gap-3"
                >
                  <Link
                    to="/shop"
                    className="touch-area hidden md:block w-full text-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-gray-700 dark:text-gray-200 font-medium"
                  >
                    {t("Continue Shopping")}
                  </Link>

                  {!isBookPurchased(bookId) && (
                    <Link
                      dir="ltr"
                      to="/cart"
                      className="touch-area flex items-center justify-center gap-2 w-full text-center px-6 py-4 border-2 border-indigo-600 dark:border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-indigo-600 dark:text-indigo-300 font-medium"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {t("View Cart")}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div dir={i18n.dir()} className="px-2 mt-4 lg:px-10 pb-8 lg:pb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-300">
                {t("Additional Details")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    ISBN:
                  </span>
                  <p
                    className="font-medium text-gray-900 dark:text-gray-200 text-sm wrap-break-word"
                    title={book.isbn}
                  >
                    {t(book.isbn)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {t("Edition")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {isNaN(Number(book.edition))
                      ? t(book.edition)
                      : i18n.language === "ar"
                        ? `الطبعة ${getArabicOrdinal(book.edition)}`
                        : `${book.edition}${getEditionSuffix(
                            book.edition,
                          )} Edition`}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {t("Year")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {t(book.year)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {t("Pages")}:
                  </span>
                  {pagesLoading ? (
                    <div className="flex items-center gap-2">
                      <Skeleton
                        width="100px"
                        height="18px"
                        baseColor="#a09daaff"
                        highlightColor="#f3f4f6"
                      />
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {t(book.pages)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author Books */}
      {book?.author && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AuthorBooks authorName={book.author} excludeBookId={bookId} />
        </div>
      )}
    </>
  );
};

export default BookDetails;
