// Carousel.jsx
import { Link } from "react-router-dom";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AuthModal from "./AuthModal";
import { FaCartPlus } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Carousel = ({ books, carouselId = "default" }) => {
  // Check if mobile on initial render
  const getInitialIndex = () => {
    // Only restore on mobile (width < 768)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const saved = sessionStorage.getItem(`carousel-index-${carouselId}`);
      if (saved) {
        const index = parseInt(saved, 10);
        // Validate the saved index
        if (index >= 0 && index < books.length) {
          return index;
        }
      }
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [booksPerView, setBooksPerView] = useState(4);
  const [itemWidth, setItemWidth] = useState(200); // Default width, will be recalculated
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
  const [isInView, setIsInView] = useState(false);

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

  // Save position to sessionStorage on mobile only
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      sessionStorage.setItem(
        `carousel-index-${carouselId}`,
        currentIndex.toString()
      );
    }
  }, [currentIndex, carouselId]);

  // Calculate normalized position for dots (0 to books.length - 1)
  const normalizedIndex = useMemo(() => {
    if (books.length === 0) return 0;
    return ((currentIndex % books.length) + books.length) % books.length;
  }, [currentIndex, books.length]);

  // Calculate item width - use ResizeObserver to ensure container is ready
  useEffect(() => {
    const container = containerRef.current;
    if (!container || booksPerView <= 0) return;

    const calculateWidth = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth === 0) return; // Container not ready yet

      const gap = 16;
      const totalGapWidth = gap * (booksPerView - 1);
      const calculatedWidth = (containerWidth - totalGapWidth) / booksPerView;
      setItemWidth(calculatedWidth);
    };

    // Calculate immediately
    calculateWidth();

    // Use ResizeObserver to recalculate when container size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateWidth();
    });
    resizeObserver.observe(container);

    // Fallback: recalculate after a short delay in case initial calculation failed
    const timeoutId = setTimeout(calculateWidth, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [booksPerView, books.length]);

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

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX; // Reset touchEndX
    setIsDragging(true);
    setWasDragging(false);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const currentX = e.touches[0].clientX;

      touchEndX.current = currentX;
      const diff = touchStartX.current - currentX;
      setDragOffset(diff);
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
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
  }, [nextSlide, prevSlide]);

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
  };

  // Intersection Observer to detect when carousel is visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Global keyboard listener when carousel is in view
  useEffect(() => {
    if (!isInView || !shouldShowNavigation) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInView, shouldShowNavigation, nextSlide, prevSlide]);

  // Mouse wheel scroll handler - only when hovering over carousel
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only capture wheel when hovering AND carousel is fully visible
    if (!isHovering || !shouldShowNavigation || !isInView) return;

    const handleWheel = (e) => {
      // Detect touchpad vs mouse wheel:
      // Touchpad usually has smaller deltaY values (< 50) and smooth scrolling
      // Mouse wheel has larger discrete values (100, 120)
      const absDeltaY = Math.abs(e.deltaY);
      const absDeltaX = Math.abs(e.deltaX);

      // If deltaX is significant, it's likely a touchpad horizontal swipe - ignore
      if (absDeltaX > 10) return;

      // If deltaY is too small, it's likely touchpad - ignore
      if (absDeltaY < 50) return;

      // Check if carousel section (including title above) is fully visible
      const container = containerRef.current;
      if (container) {
        // Get parent container which includes the title
        const parentSection = container.closest(".container");
        const sectionRect = parentSection
          ? parentSection.getBoundingClientRect()
          : container.getBoundingClientRect();
        const carouselRect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Header is fixed at ~80px
        // Title is visible when section top is above viewport but title text is below header
        // Section has padding, so title is about 50-80px below section top
        const headerHeight = 80;
        const isTitleVisible = sectionRect.top >= -50; // Title visible if section top >= -50

        // Carousel should be reasonably visible (top below header, bottom within viewport)
        const isCarouselVisible =
          carouselRect.top >= headerHeight &&
          carouselRect.bottom <= viewportHeight + 80;

        // Only capture wheel if BOTH title is visible AND carousel is in view
        if (!isTitleVisible || !isCarouselVisible) return; // Let page scroll normally
      }

      // Prevent page scroll when using mouse wheel over carousel
      e.preventDefault();

      // Simple navigation without accumulation for mouse wheel
      if (e.deltaY > 0) {
        nextSlide();
      } else if (e.deltaY < 0) {
        prevSlide();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isHovering, shouldShowNavigation, isInView, nextSlide, prevSlide]);

  const translateX = currentIndex * (itemWidth + 16) + dragOffset;

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        icon={
          <ShoppingCart className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
        }
        title={t("Please login or create an account to add book to your cart")}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <div
        className="relative"
        ref={containerRef}
        role="region"
        aria-label="Book carousel"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Show navigation buttons only when needed */}
        {shouldShowNavigation && (
          <>
            <button
              onClick={prevSlide}
              disabled={!canGoPrev}
              className={`touch-area absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 
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
              className={`touch-area absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 
              bg-white dark:bg-zinc-700 rounded-full p-2 shadow-lg dark:shadow-zinc-900 transition-all duration-200
              ${
                canGoNext
                  ? "hover:shadow-xl hover:scale-105 cursor-pointer dark:hover:bg-zinc-600"
                  : "opacity-50 cursor-not-allowed"
              }
            `}
            >
              <ChevronRight className=" w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}

        <div
          className="overflow-hidden"
          style={{ touchAction: "pan-y" }}
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
                    className="touch-area relative w-full block cursor-pointer group"
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
                        whileTap={{ scale: 1.1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onContextMenu={(e) => {
                          const isMobile =
                            window.matchMedia("(max-width: 768px)").matches;
                          if (isMobile) e.preventDefault();
                        }}
                      />
                    </div>
                    <span className="absolute text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 left-2 bottom-2 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800 z-30 pointer-events-none">
                      ₹{book.price}
                    </span>
                  </Link>
                  {/* Book Info */}
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="touch-area text-[15px] font-bold mt-3 dark:text-gray-200 mb-1 text-center line-clamp-1 text-gray-700 hover:text-indigo-500 dark:hover:text-indigo-200 focus:text-indigo-500 dark:focus:text-indigo-200 hover:underline focus:underline transition-colors cursor-pointer"
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
                    className="touch-area text-xs truncate max-w-[250px] text-center text-gray-700  dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-30"
                  >
                    {book.desc ||
                      book.description ||
                      "No description available"}
                  </p>
                  {/* Add to Cart and Details Buttons */}
                  <div className="mt-auto w-full flex gap-2 sm:flex-col lg:flex-row">
                    <Link
                      to={`/book/${book._id || book.id}`}
                      className="touch-area flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm"
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
                      className="touch-area flex-1 cursor-pointer bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white font-medium px-2 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                    >
                      <FaCartPlus className="w-4 h-4" />
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
