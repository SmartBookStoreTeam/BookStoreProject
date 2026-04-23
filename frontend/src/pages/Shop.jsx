import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Filter, Star, Grid, List, CheckCircle } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { getBooks, searchBooks, getCategoryStats } from "../api/booksApi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import AuthModal from "../components/AuthModal";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import { useGlobalLoading } from "../context/LoadingContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { getMyOrders } from "../api/ordersApi";
import BookCard from "../components/BookCard";

//fixed sortMap
const sortMap = {
  name: "title",
  "price-low": "price",
  "price-high": "-price",
  rating: "-ratings",
};

const Shop = () => {
  const { addToCart, cartItems, isBookPurchased, purchasedBooks } = useCart();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("all"); // all | regular | user
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  // Increased default price range limit
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPriceLimit] = useState(1000);

  const [apiBooks, setApiBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { setIsLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [categoryStats, setCategoryStats] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);

  // fetch category stats once
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getCategoryStats();
        if (res.success) {
          setCategoryStats(res.data);
          setTotalBooks(res.totalBooks || 0);
        }
      } catch (err) {
        console.error("Failed to fetch category stats:", err);
      }
    };
    fetchStats();
  }, []);

  // read search from URL once
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    if (searchQuery) setSearchTerm(decodeURIComponent(searchQuery));
  }, [location.search]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // sync global loading
  useEffect(() => {
    setIsLoading(loading);
    return () => setIsLoading(false);
  }, [loading, setIsLoading]);

  const [isFirstOrder, setIsFirstOrder] = useState(false);

  useEffect(() => {
    const checkFirstOrder = async () => {
      if (user) {
        try {
          const res = await getMyOrders();
          // getMyOrders returns the array directly (not wrapped in {data:[]})
          const hasOrders = Array.isArray(res) && res.length > 0;
          const hasBooksInLibrary =
            Array.isArray(purchasedBooks) && purchasedBooks.length > 0;
          setIsFirstOrder(!hasOrders && !hasBooksInLibrary);
        } catch {
          setIsFirstOrder(false);
        }
      } else {
        setIsFirstOrder(true);
      }
    };
    checkFirstOrder();
  }, [user, purchasedBooks]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategories, selectedType, sortBy, priceRange]);

  // fetch from backend with filters (including price)
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const PAGE_SIZE = 12;

        const params = {
          page,
          pageSize: PAGE_SIZE,
          sort: sortMap[sortBy] || "-createdAt",
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };

        if (selectedCategories.length > 0) {
          params.category = selectedCategories.join(",");
        }

        const res = debouncedSearch
          ? await searchBooks({ ...params, q: debouncedSearch })
          : await getBooks(params);

        setApiBooks(Array.isArray(res?.data) ? res.data : []);
        setMeta(res?.meta || null);
      } catch (e) {
        console.error(e);
        setApiBooks([]);
        setMeta({
          page: 1,
          pages: 1,
          total: 0,
          pageSize: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [
    page,
    debouncedSearch,
    selectedCategories,
    selectedType,
    sortBy,
    priceRange,
  ]);

  // Helper function to check if a specific book is in cart
  const isBookInCart = (bookToCheck) => {
    if (!bookToCheck || !cartItems) return false;
    return cartItems.some(
      (item) =>
        String(item._id || item.id) ===
        String(bookToCheck._id || bookToCheck.id),
    );
  };

  // shown list
  const storeBooks = apiBooks || [];

  const shownBooks = storeBooks;

  // categories list derived from fetched stats
  const categories = useMemo(() => {
    const filteredStats = categoryStats.filter((cat) => cat.count > 0);
    return [
      {
        value: "all",
        label: "All Categories",
        count: filteredStats.length,
      },
      ...filteredStats.map((cat) => ({
        value: cat._id,
        label: cat.name,
        count: cat.count,
      })),
    ];
     
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryStats, totalBooks]);

  const bookTypes = [
    { value: "all", label: "All Books" },
    { value: "regular", label: "Store Books" },
    { value: "user", label: "Community Books" },
  ];

  const handleAddToCart = (book) => {
    // Check if this specific book is already in cart
    if (isBookInCart(book)) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      navigate("/checkout", { state: { books: cartItems } });
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

            {/* Category Filter Section */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {t("Categories")}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => {
                  const isAll = category.value === "all";
                  const isSelected = isAll
                    ? selectedCategories.length === 0
                    : selectedCategories.includes(category.value);

                  const handleToggle = () => {
                    if (isAll) {
                      setSelectedCategories([]);
                    } else {
                      if (selectedCategories.includes(category.value)) {
                        setSelectedCategories(
                          selectedCategories.filter(
                            (c) => c !== category.value,
                          ),
                        );
                      } else {
                        setSelectedCategories([
                          ...selectedCategories,
                          category.value,
                        ]);
                      }
                    }
                  };

                  return (
                    <button
                      key={category.value}
                      onClick={handleToggle}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-400"
                      }`}
                    >
                      <span>
                        {isAll ? t(category.label) : t(category.label)}
                      </span>
                      <span
                        className={`flex items-center justify-center min-w-[18px] h-4 px-1 rounded-md text-[10px] font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div dir={i18n.dir()} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                {t("Price Range") + " "}: {priceRange[0]} - {priceRange[1]}{" "}
                {t("EGP")}
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
                <BookCard
                  key={book._id || book.id}
                  book={book}
                  viewMode={viewMode}
                  isBookPurchased={isBookPurchased}
                  isBookInCart={isBookInCart}
                  handleAddToCart={handleAddToCart}
                  isFirstOrder={isFirstOrder}
                  t={t}
                  i18n={i18n}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {selectedType !== "user" && meta?.pages > 1 && (
            <div className="flex flex-col items-center gap-3 mt-10">
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600
                   bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200
                   disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  {t("Prev")}
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: meta.pages }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors
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
                   cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  {t("Next")}
                </button>
              </div>

              <p
                dir={i18n.dir()}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {t("Page")} {meta.page} {t("of")} {meta.pages} • {t("Total")}{" "}
                {meta.total}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
