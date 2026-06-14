import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getSuggestions, getTrending } from "../api/trackingApi";
import Carousel from "./Carousel";
import Loading from "./Loading";

const normalizeBook = (b) => {
  const rating =
    typeof b.ratingAvg === "number"
      ? b.ratingAvg
      : typeof b.ratings === "number"
        ? b.ratings
        : typeof b.rate === "number"
          ? b.rate
          : 0;

  return {
    ...b,
    _id: b._id || b.id,
    id: b._id || b.id,
    desc: b.desc || b.description || "",
    description: b.description || b.desc || "",
    ratings: rating,
    numReviews: b.ratingCount || b.numReviews || 0,
  };
};

const PersonalizedBooks = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("Our Suggestions");
  const [loading, setLoading] = useState(true);

  const prevUserIdRef = useRef(undefined);
  const isFetchingRef = useRef(false); // prevent concurrent fetches

  useEffect(() => {
    const currentUserId = user?._id || user?.id || null;

    // skip if same user AND we already have books
    if (
      currentUserId === prevUserIdRef.current &&
      prevUserIdRef.current !== undefined
    )
      return;

    // skip if a fetch is already in progress
    if (isFetchingRef.current) return;

    prevUserIdRef.current = currentUserId;
    isFetchingRef.current = true;

    const fetchBooks = async () => {
      try {
        // only show spinner on very first load (no books yet)
        if (books.length === 0) setLoading(true);

        const [suggestionsRes, trendingRes] = await Promise.all([
          getSuggestions(7),
          getTrending(7),
        ]);

        if (suggestionsRes.success && suggestionsRes.data?.length > 0) {
          const hasPersonalized = suggestionsRes.data.some(
            (b) => b.suggestionType === "personalized",
          );
          const hasCategoryBased = suggestionsRes.data.some(
            (b) => b.suggestionType === "category_based",
          );

          if (hasPersonalized) {
            setTitle("Recommended For You");
            setBooks(suggestionsRes.data.map(normalizeBook));
          } else if (hasCategoryBased) {
            setTitle("Based on Your Interests");
            setBooks(suggestionsRes.data.map(normalizeBook));
          } else if (trendingRes.success && trendingRes.data?.length > 0) {
            setTitle("Trending Now");
            setBooks(trendingRes.data.map(normalizeBook));
          } else {
            setTitle("Our Suggestions");
            setBooks(suggestionsRes.data.map(normalizeBook));
          }
        } else if (trendingRes.success && trendingRes.data?.length > 0) {
          setTitle("Trending Now");
          setBooks(trendingRes.data.map(normalizeBook));
        }
      } catch (err) {
        console.error("PersonalizedBooks error:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchBooks();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 py-8 transition-colors duration-300">
        <Loading
          loading={t("Loading Suggestion books...")}
          height="h-64"
          animate={true}
        />
      </div>
    );
  }

  return (
    <div
      id="suggestions"
      className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t(title)}
        </h1>
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <p className="text-lg font-medium">
              {t("No books found in")} {t(title)}
            </p>
          </div>
        ) : (
          <Carousel books={books} />
        )}
      </div>
    </div>
  );
};

export default PersonalizedBooks;
