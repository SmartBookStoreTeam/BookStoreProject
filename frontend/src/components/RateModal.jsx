import { useState } from "react";
import { Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const RateModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating);
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };
const getAutoDir = (text = "") => {
    if (
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/.test(
        text.trim()
      )
    ) {
      return "rtl";
    }
    return "ltr";
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-zinc-700 transform transition-all scale-100 opacity-100">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="touch-area absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          aria-label={t("Close")}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <Star
              size={32}
              className="text-indigo-600 dark:text-indigo-400"
              fill="currentColor"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col items-center text-center gap-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("Rate Your Experience with")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-300">
                {bookTitle}
                {getAutoDir(bookTitle) === "rtl" ? "؟" : "?"}
              </span>
            </p>
          </div>

          {/* Star Rating */}
          <div dir="ltr" className="flex gap-2 my-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="touch-area cursor-pointer transition-all transform hover:scale-110 active:scale-95"
                  aria-label={`${value} ${t("stars")}`}
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      value <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected Rating Text */}
          {rating > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("You selected")} {rating}{" "}
              {rating === 1 ? t("star") : t("stars")}
            </p>
          )}

          {/* Action Buttons */}
          <div dir="ltr" className="flex gap-3 w-full mt-4">
            <button
              onClick={handleSkip}
              className="touch-area flex-1 px-4 py-2.5 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
            >
              {t("Maybe Later")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="touch-area flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              {t("Submit Rating")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateModal;
