import { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XCircle, ArrowLeft, ShoppingCart, AlertTriangle } from "lucide-react";

const PaymentCancel = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");

  // Redirect to shop if no order_id
  useEffect(() => {
    if (!orderId) {
      navigate("/shop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!orderId) {
    return null;
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800 pt-10 pb-12 overflow-x-hidden"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-balance">
            {t("Payment Cancelled")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("Your payment was not completed")}
          </p>
        </div>

        {/* Info Section */}
        <div className="mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Warning Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                    {t("No charges were made")}
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {t("You can try again or contact support if you need help")}
                  </p>
                </div>
              </div>
            </div>

            {/* Order ID Display */}
            {orderId && (
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t("Order ID")}: <span className="font-mono">{orderId}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/cart"
              className="touch-area flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-semibold shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t("Back to Cart")}</span>
            </Link>

            <Link
              to="/shop"
              className="touch-area flex items-center justify-center gap-2 py-3 px-4 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("Continue Shopping")}</span>
            </Link>
          </div>
        </div>

        {/* Support Notice */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t("Need help? Contact us at")}{" "}
            <a
              href="mailto:bookfly2026@gmail.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              bookfly2026@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
