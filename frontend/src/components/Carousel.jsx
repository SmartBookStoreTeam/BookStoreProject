// Carousel.jsx
import { Link } from "react-router-dom";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const Carousel = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [booksPerView, setBooksPerView] = useState(4);
  const [itemWidth, setItemWidth] = useState(0);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Calculate item width based on container and gap
  useEffect(() => {
    if (containerRef.current && booksPerView > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const gap = 16;
      const totalGapWidth = gap * (booksPerView - 1);
      const calculatedWidth = (containerWidth - totalGapWidth) / booksPerView;
      setItemWidth(calculatedWidth);
    }
  }, [booksPerView]);

  const nextSlide = () => {
    if (canGoNext) setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (canGoPrev) setCurrentIndex((prev) => prev - 1);
  };

  const totalPages = Math.max(books.length - booksPerView + 1, 1);
  const canGoNext = currentIndex < books.length - booksPerView;
  const canGoPrev = currentIndex > 0;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const touchDiff = touchStartX.current - touchEndX.current;
    if (touchDiff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  const handleAddToCart = (book) => {
    if (!user) {
      navigate("/register");
      return;
    }
    addToCart(book);
    toast.success(`"${book.title}" added to cart!`, {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  const translateX = currentIndex * (itemWidth + 16);

  return (
    <div className="relative" ref={containerRef}>
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

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {books.map((book, index) => (
            <div
              key={book.id || index}
              className="shrink-0"
              style={{ width: `${itemWidth}px` }}
            >
              <div className="w-full bg-indigo-50 dark:bg-zinc-800 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md dark:hover:shadow-zinc-700/50 transition-all duration-300">
                {/* Book Image*/}
                <Link
                  to={`/book/${book._id || book.id}`}
                  className="relative w-full block cursor-pointer"
                >
                  <img
                    className="rounded-2xl w-full h-[200px] object-cover hover:opacity-90 transition-opacity"
                    src={
                      book.img ||
                      (book.images && book.images[0]?.preview) ||
                      book.images?.[0]
                    }
                    alt={book.desc || book.title}
                  />
                  <span className="absolute text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 left-2 bottom-2 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800">
                    ₹{book.price}
                  </span>
                </Link>
                {/* Book Info */}
                <Link
                  to={`/book/${book._id || book.id}`}
                  className="text-[15px] font-bold mt-3 dark:text-gray-200 mb-1 text-center line-clamp-1 text-gray-700 hover:text-indigo-500 dark:hover:text-indigo-200 hover:underline transition-colors cursor-pointer"
                >
                  {book.title}
                </Link>
                <div className="flex justify-center items-center mb-2 space-x-1">
                  <p className="text-xs text-indigo-400 dark:text-indigo-300  line-clamp-1 transition-colors duration-300">
                    {book.author} •
                  </p>
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
                <p className="text-xs text-center text-gray-700  dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-30">
                  {book.desc}
                </p>
                {/* Add to Cart and Details Buttons */}
                <div className="mt-auto w-full flex gap-2">
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm"
                  >
                    Details
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
                      Add To Cart
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
                index === currentIndex
                  ? "bg-gray-900 dark:bg-indigo-500 w-4"
                  : "bg-gray-300 dark:bg-zinc-600 hover:bg-gray-400 dark:hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
