import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { CheckCircle, XCircle, Mail, BookOpen, Loader } from "lucide-react";
import { trackPurchase } from "../api/trackingApi";
import { verifySession } from "../api/paymentApi";

const CheckoutSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart, fetchPurchasedBooks } = useCart();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Stripe sends ?session_id=cs_xxx as query param on success redirect
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // If no session_id, redirect away
    if (!sessionId) {
      navigate("/shop");
      return;
    }

    const handleSuccess = async () => {
      try {
        // Verify payment with backend (calls Stripe API server-side)
        const data = await verifySession(sessionId);

        if (data?.success) {
          setIsSuccess(true);
          setOrderId(data?.order?._id || null);

          // Sequential: clear cart first, then refresh library
          try {
            await clearCart();
          } catch {
            // non-critical — cart will also be cleared server-side by webhook
          }
          fetchPurchasedBooks();

          // ✅ 🔥 TRACKING
          try {
            const books = JSON.parse(localStorage.getItem("lastCart") || "[]");
            if (books.length > 0) {
              await trackPurchase(books.map((b) => b._id));
              localStorage.removeItem("lastCart");
            }
          } catch (err) {
            console.error("Tracking purchase failed:", err);
          }
        } else {
          setIsSuccess(false);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── Payment Failed ──────────────────────────────────────────────────
  if (!isSuccess) {
    return (
      <div
        dir={i18n.dir()}
        className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800 pt-10 pb-12 overflow-x-hidden"
      >
        <div className="w-full max-w-337.5 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-balance">
              {t("Payment Failed")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("Something went wrong. Please try again.")}
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-col sm:flex-row">
            <button
              onClick={() => navigate(-1)}
              className="touch-area flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg cursor-pointer"
            >
              {t("Try Again")}
            </button>
            <Link
              to="/shop"
              className="touch-area flex items-center justify-center gap-2 py-3 px-6 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-semibold"
            >
              {t("Back to Shop")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Successful ──────────────────────────────────────────────
  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 pt-10 pb-12 overflow-x-hidden"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
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
            {/* Library notice */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    {t("Your books are now available!")}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t("Check your library to access your purchased books")}
                  </p>
                </div>
              </div>
            </div>

            {/* Order confirmation */}
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t("Order confirmed")}
                    {orderId && (
                      <span className="ml-2 font-mono text-xs text-gray-500 dark:text-gray-500">
                        #{orderId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/profile"
              className="touch-area flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-semibold shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("Go to My Library")}</span>
            </Link>

            <Link
              to="/shop"
              className="touch-area flex items-center justify-center gap-2 py-3 px-4 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-semibold"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("Browse More Books")}</span>
            </Link>
          </div>
        </div>

        {/* Support Notice */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t("Need help? Contact us at")}{" "}
            <a
              href="mailto:bookfly@gmail.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              bookfly@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
