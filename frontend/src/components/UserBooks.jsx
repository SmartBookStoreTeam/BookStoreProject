import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Users, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const UserBooks = () => {
  const { userBooks, addToCart } = useCart();

  // Don't show anything if no user books
  if (userBooks.length === 0) {
    return null;
  }

  const handleAddToCart = (book) => {
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Books from Our Community
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover {userBooks.length} unique books listed by our community
            members
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userBooks.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Book Image */}
              <div className="w-full h-48 bg-gray-100">
                {book.images && book.images.length > 0 ? (
                  <img
                    src={book.images[0].preview}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">No Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                    {book.title}
                  </h3>
                  <span className="text-green-600 font-bold text-lg">
                    ₹{book.price}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                {/* Category and Condition */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
                    {book.category}
                  </span>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
                    {book.condition}
                  </span>
                </div>

                {/* Description */}
                {book.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {book.description}
                  </p>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(book)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                {/* Seller Info */}
                <div className="mt-2 text-xs text-gray-500">
                  <p>From: {book.sellerName}</p>
                  <p>{book.sellerLocation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Only show if more than 4 books */}
        {userBooks.length > 4 && (
          <div className="text-center">
            <Link
              to="/shop?type=user"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Users className="w-5 h-5 mr-2" />
              View All {userBooks.length} Community Books
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserBooks;
