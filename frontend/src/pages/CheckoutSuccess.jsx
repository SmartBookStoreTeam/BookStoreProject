import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";

import {
  CheckCircle,
  Download,
  Mail,
  Clock,
  BookOpen,
  ArrowLeft,
  Eye,
} from "lucide-react";

const CheckoutSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const { books, customerInfo } = location.state || {};

  // Redirect if accessed directly without purchase - run once
  useEffect(() => {
    if (!books || books.length === 0 || !customerInfo) {
      navigate("/shop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Clear cart on success - run once
  useEffect(() => {
    if (books && books.length > 0) {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  if (!books || books.length === 0 || !customerInfo) {
    return null;
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 pt-10 pb-12 overflow-x-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon*/}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-balance">
            {t("Payment Successful!")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("Thank you for your purchase")}
          </p>
        </div>

        {/* Success Info */}
        <div className="mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Email Confirmation */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    {t("Download link sent!")}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t("Check your email")}:{" "}
                    <strong>{customerInfo.email}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Link Validity Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {t("Download link is valid for 48 hours")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Books Section - Full Width */}
        <div className="mb-6">
          {/*Books with View/Download */}
          <div className="order-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("Download Your Books")}
            </h3>
            <div className="space-y-4">
              {books.map((book, index) => (
                <div
                  key={book.id || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:shadow-md transition-shadow"
                >
                  {/* Book Image and Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          book.img ||
                          book.image ||
                          (book.images && book.images[0]) ||
                          "/placeholder-book.jpg"
                        }
                        alt={book.title}
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg shadow-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        dir="auto"
                        className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2"
                      >
                        {book.title}
                      </h2>
                      <p
                        dir="auto"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {t("By")} {book.author}
                      </p>
                    </div>
                  </div>

                  {/* View and Download Buttons*/}
                  <div className="flex gap-2 w-full sm:w-auto sm:flex-col sm:flex-shrink-0">
                    <Link
                      to={`/pdf-viewer/${book._id || book.id}`}
                      state={{ pdfUrl: book.pdf, bookTitle: book.title }}
                      className="touch-area flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all text-sm font-medium shadow-sm hover:shadow-md sm:min-w-[130px]"
                      title={t("View PDF")}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t("View")}</span>
                    </Link>
                    <a
                      href={book.pdf || "#"}
                      download
                      className="touch-area flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all text-sm font-medium shadow-sm hover:shadow-md sm:min-w-[130px]"
                      title={t("Download PDF")}
                    >
                      <Download className="w-4 h-4" />
                      <span>{t("Download")}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Only (appears after books) */}
        <div className="order-3 lg:hidden mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/shop"
              className="touch-area flex items-center justify-center gap-2 py-3 px-4 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-semibold"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("Browse More Books")}</span>
            </Link>

            <Link
              to="/profile"
              dir="ltr"
              className="touch-area group flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-semibold"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all" />
              <span>{t("Go to My Library")}</span>
            </Link>
          </div>
        </div>

        {/* Support Notice */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t("Need help? Contact us at")}{" "}
            <a
              href="mailto:bookstore@gmail.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              bookstore@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
