import { useState, useEffect } from "react";
import Carousel from "./Carousel";
import { useTranslation } from "react-i18next";
import { getTopBooks } from "../api/booksApi";
import Loading from "./Loading";
import { useGlobalLoading } from "../context/LoadingContext";

const TopRated = () => {
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
    const fetchTopBooks = async () => {
      try {
        setLoading(true);
        const response = await getTopBooks(7); // Limit to 7 books
        setBooks(response.data || []);
      } catch (error) {
        console.error("Error fetching top rated books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBooks();
  }, []);

  if (loading) {
    return (
      <div
        id="top-rated"
        className="bg-white dark:bg-zinc-900 py-8 transition-colors duration-300"
      >
        <Loading
          loading={t("Loading Top Rated Books...")}
          height="h-64"
          animate={true}
        />
      </div>
    );
  }

  return (
    <div
      id="top-rated"
      className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t("Top Rated Books")}
        </h1>
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <p className="text-lg font-medium">
              {t("No books found in")} {t("Top Rated Books")}
            </p>
          </div>
        ) : (
          <Carousel books={books} />
        )}
      </div>
    </div>
  );
};

export default TopRated;
