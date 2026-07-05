import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FastAverageColor } from "fast-average-color";
import { getImageSrc } from "../utils/imageUtils";

const fac = new FastAverageColor();

const BookCard = memo(({ 
  book, 
  viewMode, 
  isBookPurchased, 
  isBookInCart, 
  handleAddToCart, 
  isFirstOrder, 
  t, 
  i18n,
  compact = false
}) => {
  const [dominantColor, setDominantColor] = useState(null);
  const bookId = book._id || book.id;

  const handleImageLoad = (e) => {
    if (!dominantColor) {
      fac.getColorAsync(e.target, { algorithm: 'dominant' })
        .then((color) => {
          setDominantColor(color);
        })
        // eslint-disable-next-line no-unused-vars
        .catch((err) => {
          // console.error("FastAverageColor error:", err);
        });
    }
  };

  return (
    <motion.div
      key={bookId}
      className={
        viewMode === "grid"
          ? "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden flex flex-col h-full"
          : "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden flex w-full"
      }
      whileHover={dominantColor ? {
        scale: 1.02,
        borderColor: `${dominantColor.hex}80`,
        boxShadow: `0 20px 25px -5px ${dominantColor.hex}40, inset 0 -40px 60px -20px ${dominantColor.hex}1A`,
      } : { 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Image */}
      <Link
        to={`/book/${bookId}`}
        className={
          viewMode === "grid"
            ? "relative w-full block cursor-pointer group"
            : "relative w-40 shrink-0 block cursor-pointer p-4 group"
        }
      >
        <div
          className={
            viewMode === "grid"
              ? "touch-area relative w-full aspect-5/4 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800"
              : "touch-area relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700"
          }
        >
          <motion.img
            src={
              book.type === "user" &&
              book.images &&
              book.images.length > 0
                ? getImageSrc(book.images[0]) || "/placeholder-book.jpg"
                : book.image || book.img || (book.images && book.images[0]?.preview) || book.images?.[0] || "/placeholder-book.jpg"
            }
            alt={book.title}
            className={`w-full h-full ${viewMode === "grid" ? "object-contain" : "object-cover"} rounded-lg select-none`}
            draggable="false"
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
            whileTap={{ scale: 1.05, filter: "brightness(1.1)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onContextMenu={(e) => {
              const isMobile = window.matchMedia("(max-width: 768px)").matches;
              if (isMobile) e.preventDefault();
            }}
          />

          {/* Price */}
          {!isBookPurchased(bookId) && (
            <div className="absolute left-2 bottom-2 z-30 pointer-events-none flex flex-col gap-1">
              {isFirstOrder && (
                <span className="bg-green-500 text-white font-bold rounded-[5px] px-2 py-0.5 text-xs shadow-sm self-start">
                  -50%
                </span>
              )}
              <span
                dir={i18n.dir()}
                className="text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800 self-start"
              >
                {isFirstOrder ? (
                  <>
                    <span className="line-through text-gray-400 text-[11px] mr-1">
                      {book.price}
                    </span>
                    {(book.price * 0.5).toFixed(2)} {t("EGP")}
                  </>
                ) : (
                  <>{book.price} {t("EGP")}</>
                )}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div
        className={
          viewMode === "grid"
            ? "p-4 flex flex-col flex-1"
            : "p-4 flex-1 flex flex-col min-w-0 overflow-hidden"
        }
      >
        <Link
          dir="auto"
          to={`/book/${bookId}`}
          className="touch-area text-[15px] font-bold text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-200 focus:text-indigo-600 dark:focus:text-indigo-200 hover:underline focus:underline transition-colors cursor-pointer mb-2 text-center"
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
                  i < Math.round(book.ratings || book.rate || 0)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-indigo-200 fill-indigo-200"
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </div>

        <p
          dir="auto"
          className={`touch-area text-xs text-center max-w-112.5 text-gray-700 dark:text-gray-400 line-clamp-2 transition-colors duration-300 mb-3 ${
            compact ? "hidden sm:line-clamp-2 sm:block" : "min-h-10"
          }`}
        >
          {book.desc || book.description || "No description available"}
        </p>

        <div
          className={`mt-auto w-full flex gap-2 ${
            viewMode === "grid" 
              ? (compact ? "flex-col" : "flex-col sm:flex-row") 
              : "flex-col"
          }`}
        >
          <Link
            to={`/book/${bookId}`}
            className="touch-area flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm cursor-pointer"
          >
            {t("Details")}
          </Link>

          {!isBookPurchased(bookId) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(book);
              }}
              className="touch-area flex-1 cursor-pointer bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 active:scale-95 dark:hover:bg-indigo-500 text-white font-medium px-2 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
            >
              {isBookInCart(book) ? (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap">
                    {t("Go to Checkout")}
                  </span>
                </>
              ) : (
                <span className="text-xs whitespace-nowrap">{t("Add to Cart")}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

BookCard.displayName = "BookCard";

export default BookCard;
