import { useState, useEffect } from "react";
import Carousel from "./Carousel";
import { useTranslation } from "react-i18next";
import { getTopBooks } from "../api/booksApi";
import Loading from "./Loading";
import { useGlobalLoading } from "../context/LoadingContext";

const Popular = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setIsLoading } = useGlobalLoading();

  // Sync local loading with global loading bar
  useEffect(() => {
    setIsLoading(loading);
    return () => setIsLoading(false);
  }, [loading, setIsLoading]);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoading(true);
        // Fetch a bit more to shuffle from a pool
        const response = await getTopBooks(15);
        const fetchedBooks = response.data || [];

        // Shuffle and slice to 7
        const shuffled = [...fetchedBooks]
          .sort(() => 0.5 - Math.random())
          .slice(0, 7);

        setBooks(shuffled);
      } catch (error) {
        console.error("Error fetching popular books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 py-8 transition-colors duration-300">
        <Loading
          loading={t("Loading Popular books...")}
          height="h-64"
          animate={true}
        />
      </div>
    );
  }

  return (
    <div
      id="popular"
      className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t("Most Popular Books")}
        </h1>
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <p className="text-lg font-medium">
              {t("No books found in")} {t("Most Popular Books")}
            </p>
          </div>
        ) : (
          <Carousel books={books} />
        )}
      </div>
    </div>
  );
};

export default Popular;
