import { useState } from "react";
import { Search, Filter, Star, ShoppingCart, Grid, List } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const { addToCart, userBooks } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 50]);

  const { user } = useAuth();
  const navigate = useNavigate();

  
  // Sample books data
  const regularBooks = [
    {
      id: 1,
      img: assets.book1,
      title: "Cooking Made Easy",
      author: "Emily Clark",
      rate: 4,
      desc: "Simple and delicious recipes for everyday cooking",
      price: 9.99,
      category: "cooking",
    },
    {
      id: 2,
      img: assets.book2,
      title: "Healthy Living",
      author: "John Miller",
      rate: 5,
      desc: "Your guide to nutritious meals and balanced life",
      price: 12.99,
      category: "health",
    },
    {
      id: 3,
      img: assets.book3,
      title: "Creative Baking",
      author: "Sarah Jones",
      rate: 3,
      desc: "Fun and easy recipes for baking enthusiasts",
      price: 7.49,
      category: "baking",
    },
    {
      id: 4,
      img: assets.book4,
      title: "Everyday Desserts",
      author: "Mark Lee",
      rate: 4,
      desc: "Quick and tasty desserts for everyone",
      price: 10.99,
      category: "desserts",
    },
    {
      id: 5,
      img: assets.releaseBook1,
      title: "Italian Cuisine Masterclass",
      author: "Marco Romano",
      rate: 5,
      desc: "Authentic Italian recipes from traditional kitchens",
      price: 15.99,
      category: "cooking",
    },
    {
      id: 6,
      img: assets.releaseBook2,
      title: "Vegan Delights",
      author: "Lisa Green",
      rate: 4,
      desc: "Plant-based recipes for healthy living",
      price: 11.49,
      category: "health",
    },
    {
      id: 7,
      img: assets.releaseBook3,
      title: "Artisan Bread Making",
      author: "Robert Baker",
      rate: 4,
      desc: "Master the art of bread making at home",
      price: 8.99,
      category: "baking",
    },
    {
      id: 8,
      img: assets.book1,
      title: "Quick Weeknight Meals",
      author: "Jennifer Cook",
      rate: 3,
      desc: "Fast and delicious meals for busy weeknights",
      price: 6.99,
      category: "cooking",
    },
    {
      id: 9,
      img: assets.book2,
      title: "Mediterranean Diet",
      author: "Maria Santos",
      rate: 5,
      desc: "Healthy Mediterranean recipes for longevity",
      price: 13.99,
      category: "health",
    },
    {
      id: 10,
      img: assets.book3,
      title: "French Pastries",
      author: "Pierre Dubois",
      rate: 4,
      desc: "Classic French pastry techniques made easy",
      price: 14.99,
      category: "baking",
    },
    {
      id: 11,
      img: assets.book4,
      title: "Chocolate Heaven",
      author: "Anna Sweet",
      rate: 5,
      desc: "Decadent chocolate recipes for every occasion",
      price: 12.49,
      category: "desserts",
    },
    {
      id: 12,
      img: assets.releaseBook1,
      title: "Asian Street Food",
      author: "Kenji Yamamoto",
      rate: 4,
      desc: "Authentic Asian street food recipes",
      price: 11.99,
      category: "cooking",
    },
  ];

  // Combine regular books + user books
  const allBooks = [
    ...regularBooks.map((book) => ({ ...book, type: "regular" })),
    ...userBooks.map((book) => ({ ...book, type: "user" })),
  ];

  const categories = [
    { value: "all", label: "All Categories", count: regularBooks.length },
    {
      value: "cooking",
      label: "Cooking",
      count: regularBooks.filter((book) => book.category === "cooking").length,
    },
    {
      value: "baking",
      label: "Baking",
      count: regularBooks.filter((book) => book.category === "baking").length,
    },
    {
      value: "desserts",
      label: "Desserts",
      count: regularBooks.filter((book) => book.category === "desserts").length,
    },
    {
      value: "health",
      label: "Health",
      count: regularBooks.filter((book) => book.category === "health").length,
    },
  ];

  // Book types for filtering
  const bookTypes = [
    { value: "all", label: "All Books" },
    { value: "regular", label: "Store Books" },
    { value: "user", label: "Community Books" },
  ];

  // Filter and sort books
  const filteredBooks = allBooks
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      const matchesType = selectedType === "all" || book.type === selectedType;
      const matchesPrice =
        book.price >= priceRange[0] && book.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesType && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rate || 3) - (a.rate || 3); // Default rating for user books
        case "name":
        default:
          return a.title.localeCompare(b.title);
      }
    });

  const handleAddToCart = (book) => {
    if (!user) {
      navigate("/register");
      return;
    }

    addToCart(book);
    toast.success(`"${book.title}" added to cart!`, {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
            Book Shop
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Discover our curated collection of cookbooks and culinary guides
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              {/* Book Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300"
              >
                {bookTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Category Filter with counts */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 min-w-48 transition-colors duration-300"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors duration-300 ${
                    viewMode === "grid"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                      : "bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-600"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors duration-300 ${
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

          {/* Price Range Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="50"
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
                max="50"
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
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Showing {filteredBooks.length} of {allBooks.length} books
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <Filter size={16} />
            <span>Filtered</span>
          </div>
        </div>

        {/* Books Grid/List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              No books found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Try adjusting your search or filters
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
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className={
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-md dark:hover:shadow-zinc-900 transition-all duration-300"
                    : "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-md dark:hover:shadow-zinc-900 transition-all duration-300 flex"
                }
              >
                {/* Book Image */}
                <div
                  className={
                    viewMode === "grid"
                      ? "w-full h-[250px]"
                      : "w-32 h-40 shrink-0"
                  }
                >
                  <img
                    src={book.img}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Book Info */}
                <div className={viewMode === "grid" ? "p-4" : "p-6 flex-1"}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 transition-colors duration-300">
                      {book.title}
                    </h3>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg transition-colors duration-300">
                      ₹{book.price}
                    </span>
                  </div>

                  {/* Author and Category */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      by {book.author}
                    </p>
                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2 py-1 rounded-full capitalize transition-colors duration-300">
                      {book.category}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`transition-colors duration-300 ${
                            i < book.rate
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      ({book.rate})
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 min-h-10 transition-colors duration-300">
                    {book.desc}
                  </p>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
