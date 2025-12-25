// Carousel.jsx
import { Link } from "react-router-dom";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AuthModal from "./AuthModal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Carousel = ({ books, carouselId = "default" }) => {
  // Get initial index from sessionStorage
  const getInitialIndex = () => {
    const saved = sessionStorage.getItem(`carousel-index-${carouselId}`);
    return saved ? parseInt(saved, 10) : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [booksPerView, setBooksPerView] = useState(4);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [wasDragging, setWasDragging] = useState(false);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const updateBooksPerView = () => {
      if (window.innerWidth >= 1024) setBooksPerView(4);
      else if (window.innerWidth >= 768) setBooksPerView(3);
      else if (window.innerWidth >= 640) setBooksPerView(2);
      else setBooksPerView(1);
    };

    updateBooksPerView();
    window.addEventListener("resize", updateBooksPerView);
    return () => window.removeEventListener("resize", updateBooksPerView);
  }, []);

  // Calculate normalized position for dots (0 to books.length - 1)
  const normalizedIndex = useMemo(() => {
    if (books.length === 0) return 0;
    return ((currentIndex % books.length) + books.length) % books.length;
  }, [currentIndex, books.length]);

  useEffect(() => {
    if (containerRef.current && booksPerView > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const gap = 16;
      const totalGapWidth = gap * (booksPerView - 1);
      const calculatedWidth = (containerWidth - totalGapWidth) / booksPerView;
      setItemWidth(calculatedWidth);
    }
  }, [booksPerView]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= books.length - booksPerView) {
        return 0;
      }
      return prev + 1;
    });
  }, [books.length, booksPerView]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return books.length - booksPerView;
      }
      return prev - 1;
    });
  }, [books.length, booksPerView]);

  const totalPages = Math.max(books.length - booksPerView + 1, 1);

  // Hide navigation if books fit in view or very few books
  const shouldShowNavigation = books.length > booksPerView;
  const canGoNext = shouldShowNavigation;
  const canGoPrev = shouldShowNavigation;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX; // Reset touchEndX
    setIsDragging(true);
    setWasDragging(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(touchStartX.current - currentX);
    const diffY = Math.abs(touchStartY.current - currentY);

    // If horizontal movement is greater than vertical, prevent default scroll
    if (diffX > diffY) {
      e.preventDefault();
    }

    touchEndX.current = currentX;
    const diff = touchStartX.current - currentX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const touchDiff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(touchDiff) > threshold) {
      setWasDragging(true); // Mark as dragging if moved significantly
      if (touchDiff > 0) {
        nextSlide(); // Swipe left - go to next (will loop to start if at end)
      } else {
        prevSlide(); // Swipe right - go to previous (will loop to end if at start)
      }
    } else {
      setWasDragging(false); // Was just a tap
    }

    setDragOffset(0);

    // Reset wasDragging after a short delay
    setTimeout(() => setWasDragging(false), 100);
  };

  useEffect(() => {
    const container = containerRef.current;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        nextSlide();
      } else if (e.deltaY < 0) {
        prevSlide();
      }
    };

    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [nextSlide, prevSlide]); // Fixed dependencies

  const { t, i18n } = useTranslation();

  // Save current index to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      `carousel-index-${carouselId}`,
      currentIndex.toString()
    );
  }, [currentIndex, carouselId]);

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

  const translateX = currentIndex * (itemWidth + 16) + dragOffset;

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        title={t("Please login or create an account to add book to your cart")}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <div className="relative" ref={containerRef}>
        {/* Show navigation buttons only when needed */}
        {shouldShowNavigation && (
          <>
            <button
              onClick={prevSlide}
              disabled={!canGoPrev}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 
              bg-white dark:bg-zinc-700 rounded-full p-2 shadow-lg dark:shadow-zinc-900 transition-all duration-200
              ${
                canGoPrev
                  ? "hover:shadow-xl hover:scale-105 cursor-pointer dark:hover:bg-zinc-600"
                  : "opacity-50 cursor-not-allowed"
              }
            `}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={nextSlide}
              disabled={!canGoNext}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 
              bg-white dark:bg-zinc-700 rounded-full p-2 shadow-lg dark:shadow-zinc-900 transition-all duration-200
              ${
                canGoNext
                  ? "hover:shadow-xl hover:scale-105 cursor-pointer dark:hover:bg-zinc-600"
                  : "opacity-50 cursor-not-allowed"
              }
            `}
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}

        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex gap-4 ${
              !shouldShowNavigation ? "justify-center" : ""
            } ${
              isDragging ? "" : "transition-transform duration-300 ease-in-out"
            }`}
            style={{
              transform: shouldShowNavigation
                ? `translateX(-${translateX}px)`
                : "none",
            }}
          >
            {books.map((book, index) => (
              <div
                key={book._id || book.id || index}
                className="shrink-0"
                style={{ width: `${itemWidth}px` }}
              >
                <div className="w-full bg-indigo-50 dark:bg-zinc-800 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md dark:hover:shadow-zinc-700/50 transition-all duration-300">
                  {/* Book Image*/}
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="relative w-full block cursor-pointer group"
                    onClick={(e) => {
                      if (wasDragging) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="relative w-full h-[300px] sm:h-[250px] lg:h-[300px] rounded-2xl overflow-hidden">
                      <motion.img
                        className="w-full h-full object-cover rounded-2xl select-none"
                        src={
                          book.image ||
                          book.img ||
                          (book.images && book.images[0]?.preview) ||
                          book.images?.[0] ||
                          "/placeholder-book.jpg"
                        }
                        alt={book.desc || book.description || book.title}
                        draggable="false"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <span className="absolute text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 left-2 bottom-2 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800 z-30 pointer-events-none">
                      ₹{book.price}
                    </span>
                  </Link>
                  {/* Book Info */}
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="text-[15px] font-bold mt-3 dark:text-gray-200 mb-1 text-center line-clamp-1 text-gray-700 hover:text-indigo-500 dark:hover:text-indigo-200 focus:text-indigo-500 dark:focus:text-indigo-200 hover:underline focus:underline transition-colors cursor-pointer"
                    onClick={(e) => {
                      if (wasDragging) {
                        e.preventDefault();
                      }
                    }}
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
                            i < book.rate
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-indigo-200  fill-indigo-200 "
                          } transition-colors duration-300`}
                        />
                      ))}
                    </div>
                  </div>
                  <p
                    dir="auto"
                    className="text-xs truncate max-w-[200px] text-center text-gray-700  dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-30"
                  >
                    {book.desc ||
                      book.description ||
                      "No description available"}
                  </p>
                  {/* Add to Cart and Details Buttons */}
                  <div className="mt-auto w-full flex gap-2 sm:flex-col lg:flex-row">
                    <Link
                      to={`/book/${book._id || book.id}`}
                      className="flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm"
                      onClick={(e) => {
                        if (wasDragging) {
                          e.preventDefault();
                        }
                      }}
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
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2  rounded-full transition-all duration-300 cursor-pointer ${
                  index === normalizedIndex
                    ? "bg-gray-900 dark:bg-indigo-500 w-4"
                    : "bg-gray-300 dark:bg-zinc-600 hover:bg-gray-400 dark:hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Carousel;
