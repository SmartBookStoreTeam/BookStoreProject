import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/loading";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  BookOpen,
  User,
  Tag,
  Calendar,
  FileText,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getBookById } from "../api/booksApi";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookData = await getBookById(id);
        setBook(bookData);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch book details"
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBook();
    }
  }, [id]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center dark:bg-zinc-900 py-20">
        <div className="text-center">
          <Loading />
          <p className="text-gray-600 dark:text-gray-200 mt-2">
            Loading book details...
          </p>
        </div>
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="pt-20 flex items-center justify-center dark:bg-zinc-900 py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-6">
            {error ||
              "We're sorry, but we couldn't load the book details. Please try again later."}
          </p>
          <button
            className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  //Image Source
  const bookImage =
    book.images && book.images.length > 0
      ? book.images[0].preview || book.images[0]
      : assets.placeholderBook;
  return (
    <div className="min-h-screen bg-gray-50 pt-2 dark:bg-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        {/* Back Button */}
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-7 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Shop
        </button>

        {/* Book Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-[#1a1a22]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Book Image */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md aspect-3/4 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                <img
                  src={bookImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Additional Images if available */}
              {book.images && book.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4 w-full max-w-md">
                  {book.images.slice(1, 5).map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={img.preview || img}
                        alt={`${book.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex flex-col">
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">
                {book.title}
              </h1>

              {/* Author */}
              <div className="flex items-center text-xl text-gray-700 mb-4 dark:text-gray-200">
                <User className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-medium">{book.author}</span>
              </div>

              {/* Rating */}
              {book.rate && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < book.rate
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium dark:text-gray-300">
                    ({book.rate}/5)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">
                  ₹{book.price}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-xl text-gray-400 line-through ml-3">
                    ₹{book.originalPrice}
                  </span>
                )}
              </div>

              {/* Category and Condition */}
              <div className="flex flex-wrap gap-3 mb-6">
                {book.category && (
                  <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                    <Tag className="w-4 h-4 mr-1" />
                    {book.category}
                  </span>
                )}
                {book.condition && (
                  <span className="inline-flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                    <Package className="w-4 h-4 mr-1" />
                    {book.condition}
                  </span>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                {book.isbn && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                      ISBN:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {book.isbn}
                    </p>
                  </div>
                )}
                {book.edition && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                      Edition:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {book.edition}
                    </p>
                  </div>
                )}
                {book.publicationYear && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                      Year:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {book.publicationYear}
                    </p>
                  </div>
                )}
                {book.pages && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                      Pages:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {book.pages}
                    </p>
                  </div>
                )}
              </div>

              {/* Seller Info (for user books) */}
              {book.sellerName && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Seller Information
                  </h3>
                  <p className="text-gray-900 font-medium">{book.sellerName}</p>
                  {book.sellerLocation && (
                    <p className="text-sm text-gray-600">
                      {book.sellerLocation}
                    </p>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-colors ${"bg-gray-900 hover:bg-gray-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer"}`}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              {/* Quick Actions */}
              <div className="mt-4 flex gap-3 flex-col sm:flex-row">
                <Link
                  to="/shop"
                  className="flex-1 text-center py-2 border-2 border-gray-300 rounded-lg hover:bg-zinc-200 hover:border-gray-400 transition-colors text-gray-700 dark:text-gray-200 dark:hover:bg-zinc-700 font-medium"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/cart"
                  className="flex-1 text-center py-2 border-2 border-indigo-600 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-indigo-600 dark:text-gray-200 font-medium"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
