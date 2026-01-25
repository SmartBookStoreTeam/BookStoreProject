import { useState, useEffect } from "react";
import { StarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import api from "../../api/api";

const TopBooks = () => {
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/books/top?limit=5");
        if (response.data?.success && Array.isArray(response.data.data)) {
          setTopBooks(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching top books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBooks();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Top Selling Books
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : topBooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No books available
          </div>
        ) : (
          topBooks.map((book, index) => (
            <div
              key={book._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg gap-2"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <span className="font-bold text-sm">#{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800 truncate">
                    {book.title}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {book.author}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="font-bold text-gray-900">
                    {book.sales || 0}
                  </div>
                  <div className="text-xs text-gray-500">sales</div>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {(book.ratingAvg || 0).toFixed(1)}
                  </span>
                </div>
                <span className="hidden md:inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {book.category?.name || "N/A"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Growth Indicator */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">
              Overall sales growth this month
            </span>
          </div>
          <span className="text-sm font-bold text-green-600">+18.5%</span>
        </div>
      </div>
    </div>
  );
};

export default TopBooks;
