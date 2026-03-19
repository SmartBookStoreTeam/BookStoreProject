import { useTranslation } from "react-i18next";
import { ShoppingBag, X } from "lucide-react";
import { getImageSrc } from "../utils/imageUtils";

const OrderSummary = ({
  books,
  onRemoveBook,
  isFirstOrder,
  coupon, // { code, discountPercent }
  onRemoveCoupon,
}) => {
  const { t, i18n } = useTranslation();

  if (!books || books.length === 0) {
    return null;
  }

  // Totals
  const subtotal = books.reduce((sum, book) => sum + (book.price || 0), 0);
  const couponPercent =
    typeof coupon?.discountPercent === "number" ? coupon.discountPercent : 0;
  const couponDiscount =
    couponPercent > 0 ? (subtotal * couponPercent) / 100 : 0;

  // UI-only first-order discount (only when no coupon is applied)
  let firstOrderDiscount = 0;
  if (!coupon?.code && isFirstOrder && books.length > 0) {
    firstOrderDiscount = (books[0].price || 0) * 0.5;
  }

  const discount = couponDiscount > 0 ? couponDiscount : firstOrderDiscount;
  const total = Math.max(0, subtotal - discount);

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
              <div className="shrink-0">
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
                <p className="text-base font-bold bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
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
            {t("Subtotal")} ({books.length} {t("Items")})
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {subtotal.toFixed(2)} {t("EGP")}
          </span>
        </div>

        {coupon?.code && couponDiscount > 0 && (
          <div className="flex justify-between items-center mb-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
            <span className="text-sm font-medium">
              {t("Coupon")} ({coupon.code}) • {couponPercent}%
            </span>
            <span className="text-sm font-bold">
              -{couponDiscount.toFixed(2)} {t("EGP")}
            </span>
          </div>
        )}

        {!coupon?.code && isFirstOrder && firstOrderDiscount > 0 && (
          <div className="flex justify-between items-center mb-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
            <span className="text-sm font-medium">
              {t("First Order Discount (50% off 1 book)")}
            </span>
            <span className="text-sm font-bold">
              -{firstOrderDiscount.toFixed(2)} {t("EGP")}
            </span>
          </div>
        )}

        {coupon?.code && onRemoveCoupon && (
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="touch-area w-full mb-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            {t("Remove coupon")}
          </button>
        )}

        <div className="flex justify-between items-center p-4 bg-linear-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl mt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("Total")}
          </span>
          <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            {total.toFixed(2)} {t("EGP")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
