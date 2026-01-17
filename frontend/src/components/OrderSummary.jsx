import { useTranslation } from "react-i18next";
import { ShoppingBag, X } from "lucide-react";

const OrderSummary = ({ books, onRemoveBook }) => {
  const { t, i18n } = useTranslation();

  if (!books || books.length === 0) {
    return null;
  }

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

  // Calculate total
  const total = books.reduce((sum, book) => sum + (book.price || 0), 0);

  return (
    <div
      dir={i18n.dir()}
      className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-zinc-700"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-700">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("Order Summary")}
        </h2>
      </div>

      {/* Books List */}
      <div className="space-y-4 mb-6">
        {books.map((book, index) => {
          const bookImage =
            book.img ||
            book.image ||
            (book.images && book.images.length > 0
              ? getImageSrc(book.images[0]) || book.images[0]
              : null) ||
            "/placeholder-book.jpg";

          return (
            <div
              key={book.id || index}
              className="flex gap-4 pb-4 border-b border-gray-100 dark:border-zinc-700 last:border-0 relative group"
            >
              {/* Book Image */}
              <div className="flex-shrink-0">
                <img
                  src={bookImage}
                  alt={book.title}
                  className="w-20 h-24 object-cover rounded-xl shadow-md ring-1 ring-gray-200 dark:ring-zinc-700"
                />
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <h3
                  dir="auto"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-2 pr-8"
                >
                  {book.title}
                </h3>
                <p
                  dir="auto"
                  className="text-xs text-gray-500 dark:text-gray-400 mb-2"
                >
                  {t("By")} {book.author}
                </p>
                <p className="text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {book.price} {t("EGP")}
                </p>
              </div>

              {/* Remove Button - Only show if there's more than 1 book and onRemoveBook is provided */}
              {books.length > 1 && onRemoveBook && (
                <button
                  onClick={() => onRemoveBook(book.id)}
                  className="touch-area absolute top-0 right-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title={t("Remove from order")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Price Section */}
      <div className="pt-4 border-t-2 border-gray-200 dark:border-zinc-700">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t("Items")} ({books.length})
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {total} {t("EGP")}
          </span>
        </div>
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("Total")}
          </span>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            {total} {t("EGP")}
          </span>
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
        <p className="text-sm text-blue-900 dark:text-blue-200 text-balance flex items-start gap-2">
          <span className="text-lg">📧</span>
          <span>
            {t("After payment, download links will be sent to your email")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
