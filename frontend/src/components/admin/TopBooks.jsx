import { StarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const TopBooks = () => {
  const topBooks = [
    {
      title: "Digital Dreams",
      author: "John Smith",
      sales: 342,
      rating: 4.8,
      category: "Technology",
    },
    {
      title: "The Silent Echo",
      author: "Jane Doe",
      sales: 298,
      rating: 4.9,
      category: "Fiction",
    },
    {
      title: "Code Revolution",
      author: "Mike Chen",
      sales: 256,
      rating: 4.7,
      category: "Programming",
    },
    {
      title: "Mindful Living",
      author: "Lisa Wong",
      sales: 234,
      rating: 4.6,
      category: "Self-Help",
    },
    {
      title: "Data Science 101",
      author: "Sarah Miller",
      sales: 189,
      rating: 4.5,
      category: "Education",
    },
  ];

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
        {topBooks.map((book, index) => (
          <div
            key={book.title}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
              <div>
                <div className="font-medium text-gray-800">{book.title}</div>
                <div className="text-sm text-gray-600">{book.author}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-bold text-gray-900">{book.sales}</div>
                <div className="text-xs text-gray-500">sales</div>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{book.rating}</span>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {book.category}
              </span>
            </div>
          </div>
        ))}
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
