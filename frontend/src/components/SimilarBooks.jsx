import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion";
import BookCard from "./BookCard";
import { getSimilarBooks } from "../api/recommendationsApi";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden animate-pulse">
    <div className="w-full aspect-5/4 bg-gray-200 dark:bg-zinc-700 rounded-t-xl" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mx-auto" />
      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mx-auto" />
      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded-lg flex-1" />
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded-lg flex-1" />
      </div>
    </div>
  </div>
);

const SimilarBooks = ({ bookId }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, isFirstOrder } = useCart();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setError(false);
    getSimilarBooks(bookId, 5)
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setBooks(res.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  const isBookPurchased = useCallback(
    (id) => user?.purchasedBooks?.includes(id) ?? false,
    [user],
  );

  const isBookInCart = useCallback(
    (book) =>
      cart?.some((item) => (item._id || item.id) === (book._id || book.id)),
    [cart],
  );

  const handleAddToCart = useCallback(
    (book) => {
      if (!user) {
        navigate("/login");
        return;
      }
      addToCart(book);
    },
    [user, addToCart, navigate],
  );

  if (!loading && (error || books.length === 0)) return null;

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t("You Can Also Like")}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="wait">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            : books.map((book, i) => (
                <motion.div
                  key={book._id || book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="h-full"
                >
                  <BookCard
                    book={book}
                    viewMode="grid"
                    isBookPurchased={isBookPurchased}
                    isBookInCart={isBookInCart}
                    handleAddToCart={handleAddToCart}
                    isFirstOrder={isFirstOrder}
                    t={t}
                    i18n={i18n}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SimilarBooks;
