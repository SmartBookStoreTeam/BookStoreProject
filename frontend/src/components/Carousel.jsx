// Carousel.jsx
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";

const Carousel = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [booksPerView, setBooksPerView] = useState(4);
  const [itemWidth, setItemWidth] = useState(0);
  const containerRef = useRef(null);

  const { addToCart } = useCart();

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
      const gap = 16; // gap-4 = 16px
      const totalGapWidth = gap * (booksPerView - 1);
      const calculatedWidth = (containerWidth - totalGapWidth) / booksPerView;
      setItemWidth(calculatedWidth);
    }
  }, [booksPerView]);

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const totalPages = Math.max(books.length - booksPerView + 1, 1);
  const canGoNext = currentIndex < books.length - booksPerView;
  const canGoPrev = currentIndex > 0;

  const handleAddToCart = (book) => {
    addToCart(book);
    toast.success(`"${book.title}" added to cart!`, {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  // Calculate translateX based on actual item width and gap
  const translateX = currentIndex * (itemWidth + 16); // 16px for gap-4

  return (
    <div className="relative" ref={containerRef}>
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={!canGoPrev}
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg transition-all duration-200 ${
          canGoPrev
            ? "hover:shadow-xl hover:scale-105 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        disabled={!canGoNext}
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg transition-all duration-200 ${
          canGoNext
            ? "hover:shadow-xl hover:scale-105 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Carousel Slides */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${translateX}px)`,
          }}
        >
          {books.map((book, index) => (
            <div
              key={book.id || index}
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px` }}
            >
              <div className="w-full bg-indigo-50 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition">
                {/* Book Image */}
                <div className="relative">
                  <img
                    className="rounded-2xl w-full h-[200px] object-cover"
                    src={book.img}
                    alt={book.desc}
                  />
                  <span className="absolute text-indigo-600 font-bold rounded-[5px] bg-white left-2 bottom-2 px-2 py-[2px] text-sm shadow-sm">
                    ₹{book.price}
                  </span>
                </div>

                {/* Book Info */}
                <h2 className="text-[15px] font-bold mt-3 mb-1 text-center line-clamp-1">
                  {book.title}
                </h2>

                <div className="flex justify-center items-center mb-2 space-x-1">
                  <p className="text-xs text-indigo-400 line-clamp-1">
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
                            : "text-indigo-200 fill-indigo-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-center text-gray-700 line-clamp-2">
                  {book.desc}
                </p>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(book)}
                  className="mt-3 w-full cursor-pointer bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add To Cart</span>
                </button>
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
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-gray-900 w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
