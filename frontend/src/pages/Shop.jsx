import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, Star, Grid, List } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { getBooks, searchBooks } from "../api/booksApi";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import AuthModal from "../components/AuthModal";
import { FaCartPlus } from "react-icons/fa";
import { useGlobalLoading } from "../context/LoadingContext";
import { motion } from "framer-motion";

// Mock data fallback
const mockBooks = [
  {
    _id: "1",
    title: "Cooking Made Easy",
    author: "Emily Clark",
    price: 9.99,
    category: "cooking",
    rate: 4,
    desc: "Simple and delicious recipes for everyday cooking",
    img: assets.book1,
  },
  {
    _id: "2",
    title: "Healthy Living",
    author: "John Miller",
    price: 12.99,
    category: "health",
    rate: 5,
    desc: "Your guide to nutritious meals and balanced life",
    img: assets.book2,
  },
  {
    _id: "3",
    title: "Creative Baking",
    author: "Sarah Jones",
    price: 7.49,
    category: "baking",
    rate: 3,
    desc: "Fun and easy recipes for baking enthusiasts",
    img: assets.book3,
  },
  {
    _id: "4",
    title: "Everyday Desserts",
    author: "Mark Lee",
    price: 10.99,
    category: "desserts",
    rate: 4,
    desc: "Quick and tasty desserts for everyone",
    img: assets.book4,
  },
  {
    _id: "5",
    title: "Italian Cuisine Masterclass",
    author: "Marco Romano",
    price: 15.99,
    category: "cooking",
    rate: 5,
    desc: "Authentic Italian recipes from traditional kitchens",
    img: assets.releaseBook1,
  },
  {
    _id: "6",
    title: "Vegan Delights",
    author: "Lisa Green",
    price: 11.49,
    category: "health",
    rate: 4,
    desc: "Plant-based recipes for healthy living",
    img: assets.releaseBook2,
  },
  {
    _id: "7",
    title: "Artisan Bread Making",
    author: "Robert Baker",
    price: 8.99,
    category: "baking",
    rate: 4,
    desc: "Master the art of bread making at home",
    img: assets.releaseBook3,
  },
  {
    _id: "8",
    title: "Quick Weeknight Meals",
    author: "Jennifer Cook",
    price: 6.99,
    category: "cooking",
    rate: 3,
    desc: "Fast and delicious meals for busy weeknights",
    img: assets.book1,
  },
];

// ✅ ثابتة خارج الكومبوننت (مهم عشان deps)
const sortMap = {
  name: "title",
  "price-low": "price",
  "price-high": "-price",
  rating: "-ratings",
};

const Shop = () => {
  const { addToCart, userBooks, isBookPurchased } = useCart();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // all | regular | user
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  const [priceRange, setPriceRange] = useState([0, 50]);
  const [maxPriceLimit] = useState(50);

  const [apiBooks, setApiBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { setIsLoading } = useGlobalLoading();

  // ✅ read search from URL once
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    if (searchQuery) setSearchTerm(decodeURIComponent(searchQuery));
  }, [location.search]);

  // ✅ debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // ✅ sync global loading
  useEffect(() => {
    setIsLoading(loading);
    return () => setIsLoading(false);
  }, [loading, setIsLoading]);

  // helper for user book images
  const getImageSrc = (image) => {
    if (!image) return null;
    if (image.base64) return image.base64;
    if (image.preview) return image.preview;
    if (image.url) return image.url;
    return null;
  };

  const getCategoryId = (book) =>
    typeof book.category === "string" ? book.category : book.category?._id;

  const getCategoryName = (book) =>
    typeof book.category === "string"
      ? book.category
      : book.category?.name || "Unknown";

  // ✅ reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedType, sortBy, priceRange]);

  // ✅ fetch from backend with filters (including price)
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // لو user فقط => ما تضربش API
        if (selectedType === "user") {
          setApiBooks([]);
          setMeta({
            page: 1,
            pages: 1,
            total: userBooks.length,
            pageSize: userBooks.length,
          });
          return;
        }

        const PAGE_SIZE = 12;

        const params = {
          page,
          pageSize: PAGE_SIZE,
          sort: sortMap[sortBy] || "-createdAt",
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };

        if (selectedCategory !== "all") params.category = selectedCategory;

        const res = debouncedSearch
          ? await searchBooks({ ...params, q: debouncedSearch })
          : await getBooks(params);

        setApiBooks(Array.isArray(res?.data) ? res.data : []);
        setMeta(res?.meta || null);
      } catch (e) {
        console.error(e);
        setApiBooks(mockBooks);
        setMeta({
          page: 1,
          pages: 1,
          total: mockBooks.length,
          pageSize: mockBooks.length,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [
    page,
    debouncedSearch,
    selectedCategory,
    selectedType,
    sortBy,
    priceRange,
    userBooks.length,
  ]);

  // ✅ shown list (بدون خلط pagination)
  const storeBooks = apiBooks.length ? apiBooks : mockBooks;

  const shownBooks = useMemo(() => {
    if (selectedType === "user") {
      return userBooks.map((b) => ({ ...b, type: "user" }));
    }
    if (selectedType === "regular") {
      return storeBooks.map((b) => ({ ...b, type: "regular" }));
    }
    // all: عرض store + user (بس هنا meta بتاعة الباك تخص store فقط)
    return [
      ...storeBooks.map((b) => ({ ...b, type: "regular" })),
      ...userBooks.map((b) => ({ ...b, type: "user" })),
    ];
  }, [selectedType, storeBooks, userBooks]);

  // ✅ categories + counts (counts للـ current shown dataset عشان ما تعملش “5 وانت شايف 3”)
  const categorySource = useMemo(() => {
    if (selectedType === "user") return userBooks;
    if (selectedType === "regular") return storeBooks;
    return [...storeBooks, ...userBooks];
  }, [selectedType, storeBooks, userBooks]);

  const allCategories = useMemo(() => {
    return [...new Set(categorySource.map((b) => getCategoryId(b)))].filter(
      Boolean,
    );
  }, [categorySource]);

  const categories = useMemo(() => {
    return [
      {
        value: "all",
        label: t("All Categories"),
        count:
          selectedType === "regular" && meta?.total != null
            ? meta.total
            : categorySource.length,
      },
      ...allCategories.map((catId) => {
        const first = categorySource.find((b) => getCategoryId(b) === catId);
        const name = first ? getCategoryName(first) : "Category";
        const count = categorySource.filter(
          (b) => getCategoryId(b) === catId,
        ).length;

        return { value: catId, label: name, count };
      }),
    ];
  }, [t, selectedType, meta?.total, categorySource, allCategories]);

  const bookTypes = [
    { value: "all", label: "All Books" },
    { value: "regular", label: "Store Books" },
    { value: "user", label: "Community Books" },
  ];

  const handleAddToCart = (book) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToCart(book);
    toast.success(`${t("Added")} "${book.title}" ${t("to Cart")}!`, {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
        direction: i18n.dir(),
        width: "fit-content",
        maxWidth: "90vw",
        minWidth: "200px",
        padding: "12px 16px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    });
  };

  return (
    <>
      <AuthModal
        title={t("Please login or create an account to add book to your cart")}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 pt-2">
        <div className="w-full max-w-337.5 mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              {t("Book Shop")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              {t("discoverBooks", "Discover our curated collection of books")}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6 mb-8 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="touch-area flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300" />
                <input
                  type="text"
                  dir={i18n.dir()}
                  placeholder={`${t("Search books or authors")}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 focus:hover:bg-transparent dark:focus:hover:bg-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4 flex-wrap">
                {/* Book Type */}
                <div className="touch-area relative rounded-lg">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  >
                    {bookTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(type.label)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="touch-area relative rounded-lg">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 min-w-48 transition-colors duration-300"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {t(category.label)} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="touch-area relative rounded-lg">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  >
                    <option value="name">{t("Sort by Name")}</option>
                    <option value="price-low">
                      {t("price-low", "Price: Low to High")}
                    </option>
                    <option value="price-high">
                      {t("price-high", "Price: High to Low")}
                    </option>
                    <option value="rating">{t("Highest Rated")}</option>
                  </select>
                </div>

                {/* View */}
                <div className="flex border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`touch-area p-3 transition-colors duration-300 ${
                      viewMode === "grid"
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                        : "bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-600"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`touch-area p-3 transition-colors duration-300 ${
                      viewMode === "list"
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                        : "bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-600"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div dir={i18n.dir()} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                {t("Price Range") + " "}: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="1"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="flex-1 accent-indigo-600 dark:accent-indigo-500"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="1"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="flex-1 accent-indigo-600 dark:accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div
            dir={i18n.dir()}
            className="flex justify-between items-center mb-6"
          >
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {t("Loading books...")}
              </p>
            ) : (
              <p className="text-gray-600">
                {t("Showing")} {shownBooks.length} {t("of")}{" "}
                {meta?.total ?? shownBooks.length} {t("books")}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <Filter size={16} />
              <span>{t("Filter")}</span>
            </div>
          </div>

          {/* Books */}
          {loading ? (
            <Loading height="min-h-[60vh]" animate={true} />
          ) : shownBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                {t("NoBooksAvailable", "No books found")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {t("Try adjusting your search or filters")}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-6"
              }
            >
              {shownBooks.map((book) => (
                <div
                  key={book._id || book.id}
                  className={
                    viewMode === "grid"
                      ? "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-md dark:hover:shadow-zinc-900 transition-all duration-300 flex flex-col"
                      : "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-md dark:hover:shadow-zinc-900 transition-all duration-300 flex"
                  }
                >
                  {/* Image */}
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className={
                      viewMode === "grid"
                        ? "relative w-full block cursor-pointer p-4 group"
                        : "relative w-40 shrink-0 block cursor-pointer p-4 group"
                    }
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "touch-area relative w-full h-75 rounded-2xl overflow-hidden"
                          : "touch-area relative w-full h-40 rounded-2xl overflow-hidden"
                      }
                    >
                      <motion.img
                        src={
                          book.type === "user" &&
                          book.images &&
                          book.images.length > 0
                            ? getImageSrc(book.images[0]) ||
                              "/placeholder-book.jpg"
                            : book.image ||
                              book.img ||
                              (book.images && book.images[0]?.preview) ||
                              book.images?.[0] ||
                              "/placeholder-book.jpg"
                        }
                        alt={book.title}
                        className="w-full h-full object-cover rounded-2xl select-none"
                        draggable="false"
                        whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                        whileTap={{ scale: 1.05, filter: "brightness(1.1)" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onContextMenu={(e) => {
                          const isMobile =
                            window.matchMedia("(max-width: 768px)").matches;
                          if (isMobile) e.preventDefault();
                        }}
                      />

                      {/* Price */}
                      <span className="absolute left-2 bottom-2 text-indigo-600 dark:text-indigo-300 font-bold rounded-[5px] bg-white dark:bg-zinc-900 px-2 py-0.5 text-sm shadow-sm dark:shadow-zinc-800 z-30 pointer-events-none">
                        ₹{book.price}
                      </span>
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
                      to={`/book/${book._id || book.id}`}
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
                      className="touch-area text-xs text-center truncate max-w-112.5 text-gray-700 dark:text-gray-400 line-clamp-2 min-h-10 transition-colors duration-300 mb-3"
                    >
                      {book.desc ||
                        book.description ||
                        "No description available"}
                    </p>

                    <div
                      className={`mt-auto w-full flex gap-2 ${
                        viewMode === "grid" ? "flex-row" : "flex-col"
                      }`}
                    >
                      <Link
                        to={`/book/${book._id || book.id}`}
                        className="touch-area flex-1 text-center px-2 py-2 border border-indigo-500 rounded-lg transition-colors text-indigo-600 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium text-sm cursor-pointer"
                      >
                        {t("Details")}
                      </Link>

                      {!isBookPurchased(book._id || book.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(book);
                          }}
                          className="touch-area flex-1 cursor-pointer bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 active:scale-95 dark:hover:bg-indigo-500 text-white font-medium px-2 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          <FaCartPlus size={14} />
                          <span className="text-xs">{t("Add to Cart")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination (فقط للـ regular/all اللي بيستخدموا meta من الباك) */}
          {selectedType !== "user" && meta?.pages > 1 && (
            <div className="flex flex-col items-center gap-3 mt-10">
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600
                   bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: meta.pages }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors
                          ${
                            active
                              ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                              : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page >= meta.pages}
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600
                   bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Next
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {meta.page} of {meta.pages} • Total {meta.total}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
