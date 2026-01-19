import { useState, useEffect } from "react";
import Carousel from "./Carousel";
import { useTranslation } from "react-i18next";
import { getTopBooks } from "../api/booksApi";
import Loading from "./Loading";
import { useGlobalLoading } from "../context/LoadingContext";

const Suggestion = ({ title = "Our Suggestions" }) => {
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
    const fetchSuggestionBooks = async () => {
      try {
        setLoading(true);
        // Fetch more books to shuffle from a larger pool
        const response = await getTopBooks(20);
        const fetchedBooks = response.data || [];

        // Shuffle books
        const shuffled = [...fetchedBooks].sort(() => 0.5 - Math.random());

        setBooks(shuffled);
      } catch (error) {
        console.error("Error fetching suggestion books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestionBooks();
  }, []);

  if (loading) {
    return (
      <div
        id="suggestions"
        className="bg-white dark:bg-zinc-900 py-8 transition-colors duration-300"
      >
        <Loading
          loading={t("Loading Suggestion books...")}
          height="h-64"
          animate={true}
        />
      </div>
    );
  }

  // Don't render section if no books
  if (books.length === 0) return null;

  return (
    <div
      id="suggestions"
      className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8"
    >
      <div className="w-full max-w-[1350px] mx-auto px-4 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t(title)}
        </h1>
        <Carousel books={books} />
      </div>
    </div>
  );
};

export default Suggestion;
