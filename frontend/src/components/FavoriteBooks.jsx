import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBooks } from "../api/booksApi";
import { getImageSrc } from "../utils/imageUtils";
import api from "../api/api";

const FavoriteBooks = () => {
  const [bookCount, setBookCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [soldCount, setSoldCount] = useState(null);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [booksAvailable, setBooksAvailable] = useState(false);
  const [stats, setStats] = useState(null);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), ms),
        ),
      ]);

    const pickImage = (book) => {
      const candidate =
        book?.image ||
        book?.img ||
        (Array.isArray(book?.images) && book.images.length > 0
          ? book.images[0]
          : null);
      return getImageSrc(candidate);
    };

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const fetchFavoriteBooks = async () => {
      try {
        const res = await withTimeout(
          getBooks({ page: 1, pageSize: 12, sort: "-createdAt" }),
          2500,
        );

        // If backend is down, `getBooks` might return mock fallback.
        if (res?.fallback) throw new Error("backend-fallback");

        const list = Array.isArray(res?.data) ? res.data : [];
        const active = list.filter((b) => b?.isActive !== false);

        const normalized = active
          .map((b) => ({
            id: b._id || b.id,
            title: b.title,
            img: pickImage(b),
          }))
          .filter((b) => Boolean(b.id) && Boolean(b.img));

        // Try to load real stats (may require admin auth; if it fails we still show book total)
        let totalCustomers = null;
        let totalOrders = null;
        try {
          const analyticsRes = await withTimeout(
            api.get("/admin/dashboard/analytics"),
            2500,
          );
          const metrics = analyticsRes?.data?.data?.metrics;
          if (typeof metrics?.totalCustomers === "number") {
            totalCustomers = metrics.totalCustomers;
          }
          if (typeof metrics?.totalOrders === "number") {
            totalOrders = metrics.totalOrders;
          }
        } catch {
          // ignore analytics errors (401/403/etc)
        }

        const bookTotal =
          typeof res?.meta?.total === "number" ? res.meta.total : list.length;

        if (!cancelled) {
          const randomSix = shuffle(normalized).slice(0, 6);
          setFavoriteBooks(randomSix);
          setBooksAvailable(normalized.length > 0);
          setStats({
            bookTotal,
            totalCustomers,
            totalOrders,
          });
        }
      } catch {
        if (!cancelled) {
          setFavoriteBooks([]);
          setBooksAvailable(false);
          setStats(null);
        }
      }
    };

    fetchFavoriteBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!inView || !stats) return;
    setBookCount(stats.bookTotal ?? 0);
    setUserCount(stats.totalCustomers);
    setSoldCount(stats.totalOrders);
  }, [inView, stats]);

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-zinc-900 transition-colors duration-300"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 py-12">
        <div
          className={`flex flex-col lg:flex-row items-center justify-between gap-12 ${
            !booksAvailable ? "justify-center" : ""
          }`}
        >
          {/* Left Side (Books Grid) */}
          {booksAvailable && (
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-start rounded-lg">
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                {favoriteBooks.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  >
                    <img
                      src={b.img}
                      alt={b.title || "Book"}
                      className="w-full aspect-[3/4] object-cover"
                      draggable="false"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Side */}
          <div
            className={`w-full text-center ${
              booksAvailable ? "lg:w-1/2 lg:text-left" : "max-w-2xl"
            }`}
          >
            <h1 className="touch-area text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("Find Your Favorite")} <br />
              <span
                dir={i18n.dir()}
                className="text-indigo-500 dark:text-indigo-400"
              >
                {t("Book Here")}!
              </span>
            </h1>

            <p className="touch-area text-gray-600 dark:text-gray-300 text-[16px] leading-relaxed mb-8 max-w-2xl transition-colors duration-300">
              {t(
                "LandingExploreParagraph",
                "Find Your Favorite — 1200+ Books Available"
              )}
            </p>

            {/* Stats */}
            <div
              className={`grid grid-cols-3 gap-6 mb-8 max-w-md ${
                booksAvailable ? "mx-auto lg:mx-0" : "mx-auto"
              }`}
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 transition-colors duration-300">
                  {typeof bookCount === "number" ? `${bookCount}+` : "--"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {t("Book Listing")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 transition-colors duration-300">
                  {typeof userCount === "number" ? `${userCount}+` : "--"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {t("Register User")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 transition-colors duration-300">
                  {typeof soldCount === "number" ? `${soldCount}+` : "--"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {t("Books Sold")}
                </div>
              </div>
            </div>
            <Link
              to="/explore"
              className={`touch-area bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg dark:shadow-indigo-900/50 hover:shadow-xl ${
                booksAvailable ? "" : "mx-auto inline-block"
              }`}
            >
              {t("Explore Now")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteBooks;
