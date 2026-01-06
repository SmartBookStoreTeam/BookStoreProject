import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Users, ShoppingCart, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserBooks = () => {
  const { userBooks, addToCart } = useCart();
  const { t, i18n } = useTranslation();

  // Don't show anything if no user books
  if (userBooks.length === 0) {
    return null;
  }

  const handleAddToCart = (book) => {
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
    <section className="py-12 bg-gray-50 dark:bg-zinc-900">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
              {t("Books from Our Community")}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-200 text-lg max-w-2xl mx-auto">
            {t("Discover")} {userBooks.length}{" "}
            {t("unique books listed by our community members")}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userBooks.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Book Image*/}
              <Link
                to={`/book/${book._id || book.id}`}
                className="w-full h-48 bg-gray-100 dark:bg-zinc-700 block cursor-pointer"
              >
                {book.images && book.images.length > 0 ? (
                  <img
                    src={book.images[0].preview}
                    alt={book.title}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">{t("No Image")}</span>
                    </div>
                  </div>
                )}
              </Link>

              {/* Book Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-200 line-clamp-2 flex-1 mr-2 hover:text-green-600 transition-colors cursor-pointer"
                  >
                    {book.title}
                  </Link>
                  <span className="text-green-600 font-bold text-lg">
                    ₹{book.price}
                  </span>
                </div>

                <Link
                  to={`/author/${encodeURIComponent(book.author)}`}
                  className="text-sm text-gray-600 dark:text-gray-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
                >
                  by {book.author}
                </Link>

                {/* Category*/}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
                    {book.category}
                  </span>
                </div>

                {/* Description */}
                {book.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 line-clamp-2">
                    {book.description}
                  </p>
                )}

                {/*Add to Cart, Details Buttons */}
                <div className="flex gap-2">
                  <Link
                    to={`/book/${book._id || book.id}`}
                    className="flex-1 text-center py-2 border border-indigo-500 dark:text-gray-200  dark:hover:bg-zinc-700 hover:bg-gray-100 rounded-lg transition-colors text-indigo-600 font-medium text-l"
                  >
                    {t("Details")}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(book);
                    }}
                    className="flex-1 bg-gray-900 dark:bg-indigo-800 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingCart size={16} />
                    {t("Add to Cart")}
                  </button>
                </div>

                {/* Seller Info */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-200">
                  <p>
                    {t("From")}: {book.sellerName}
                  </p>
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
              {t("View All")} {userBooks.length} {t("Community Books")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
export default UserBooks;
