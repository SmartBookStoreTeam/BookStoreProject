import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import OrderSummary from "../components/OrderSummary";
import CustomerInfoForm from "../components/CustomerInfoForm";
import PaymentMethods from "../components/PaymentMethods";
import TrustSection from "../components/TrustSection";
import AuthModal from "../components/AuthModal";
import { ArrowLeft, Loader, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import { createCheckoutSession } from "../api/paymentApi";
import { getMyOrders } from "../api/ordersApi";
import { applyCoupon } from "../api/couponsApi";

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();

  // Initialize books once from location or cart
  const initialBooks = location.state?.books || cartItems;

  // Track books in local state to allow removal without causing re-renders
  const [currentBooks, setCurrentBooks] = useState(initialBooks);

  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || "",
    name: user?.name || "",
  });

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState("idle"); // idle | applying | applied | error
  const [couponData, setCouponData] = useState(null); // { code, discountPercent }
  const [couponError, setCouponError] = useState("");

  // Check if this is the user's first order
  useEffect(() => {
    const checkFirstOrder = async () => {
      if (user) {
        try {
          const res = await getMyOrders();
          // Filter to only count approved orders (or all orders depending on logic)
          // We will count any order, or maybe just approved ones.
          // Let's count all orders. If they have no orders, it's their first.
          const hasOrders = Array.isArray(res?.data) && res.data.length > 0;
          setIsFirstOrder(!hasOrders);
        } catch (error) {
          console.error("Failed to fetch user orders:", error);
          setIsFirstOrder(false); // Default to no discount on error
        }
      }
    };
    checkFirstOrder();
  }, [user]);

  // Redirect if no books - run only once
  useEffect(() => {
    if (!currentBooks || currentBooks.length === 0) {
      toast.error(t("No books selected for checkout"));
      navigate("/shop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle remove book from checkout
  const handleRemoveBook = (bookId) => {
    const updatedBooks = currentBooks.filter((book) => book.id !== bookId);

    if (updatedBooks.length === 0) {
      toast.error(t("Cannot checkout with 0 books"));
      navigate("/cart");
      return;
    }

    // Update local state only
    setCurrentBooks(updatedBooks);
  };

  // Email validation
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle checkout
  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate email
    if (!customerInfo.email) {
      setErrors({ email: t("Email is required") });
      toast.error(t("Please enter your email"));
      return;
    }

    if (!isEmailValid(customerInfo.email)) {
      setErrors({ email: t("Please enter a valid email") });
      toast.error(t("Please enter a valid email address"));
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const items = currentBooks.map((book) => ({
        bookId: book._id || book.id,
        quantity: 1, // Always 1 for digital books
      }));

      // Call Paymob checkout API
      const response = await createCheckoutSession(
        items,
        couponData?.code || null,
      );

      if (response.success && response.data?.iframeUrl) {
        // Redirect to Paymob iframe payment page
        window.location.href = response.data.iframeUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        t(error.response?.data?.message) ||
          t("Payment failed. Please try again."),
        {
          duration: 5000,
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
        },
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentBooks || currentBooks.length === 0) {
    return null;
  }

  const isFormValid = customerInfo.email && isEmailValid(customerInfo.email);
  // Button is enabled for non-logged-in users (to show auth modal) or when form is valid for logged-in users
  const isButtonDisabled = loading || (user && !isFormValid);

  const handleApplyCoupon = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const code = couponCode.trim();
    if (!code) return;

    setCouponError("");
    setCouponStatus("applying");
    try {
      const res = await applyCoupon(code);
      const data = res?.data;
      if (!res?.success || !data?.code || typeof data?.discountPercent !== "number") {
        throw new Error("Invalid coupon response");
      }
      setCouponData({ code: data.code, discountPercent: data.discountPercent });
      setCouponStatus("applied");
      toast.success(t("Coupon applied"), { duration: 1500 });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("Failed to apply coupon");
      setCouponData(null);
      setCouponStatus("error");
      setCouponError(t(msg));
      toast.error(t(msg), { duration: 2500 });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponStatus("idle");
    setCouponError("");
    setCouponCode("");
  };

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 py-4 overflow-x-hidden"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div dir="ltr" className="mb-6 md:hidden">
          <button
            onClick={() => navigate(-1)}
            className="touch-area flex items-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-100/10 rounded-full transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t("Go Back")}</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-balance">
            {t("Complete Your Purchase")}
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Forms - Takes 7 columns on large screens */}
          <div className="lg:col-span-7 space-y-6">
            <CustomerInfoForm
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
              errors={errors}
            />

            <PaymentMethods
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
            />

            <TrustSection />
          </div>

          {/* Order Summary - Takes 5 columns on large screens */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <OrderSummary
                books={currentBooks}
                onRemoveBook={handleRemoveBook}
                isFirstOrder={couponData ? false : isFirstOrder}
                coupon={couponData}
                onRemoveCoupon={handleRemoveCoupon}
              />

              {/* Coupon UI */}
              <div className="mt-4 bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {t("Have a coupon?")}
                  </h3>
                  {couponData?.code && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="touch-area text-sm font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      {t("Remove")}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponStatus === "applying" || Boolean(couponData)}
                    placeholder={t("Enter coupon code")}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      couponStatus === "applying" ||
                      Boolean(couponData) ||
                      couponCode.trim().length === 0
                    }
                    className="touch-area px-4 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {couponStatus === "applying" ? t("Applying...") : t("Apply")}
                  </button>
                </div>

                {couponError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {couponError}
                  </p>
                )}
                {couponData?.code && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t("Applied")}: {couponData.code} ({couponData.discountPercent}%)
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isButtonDisabled}
                className={`touch-area cursor-pointer w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-700 ${
                  isButtonDisabled
                    ? "bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>{t("Processing...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("Complete Purchase")}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 px-2">
                {t("By purchasing, you agree to our terms and conditions")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Please login or create an account to complete your purchase"
        icon={
          <ShoppingCart className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
        }
      />
    </div>
  );
};

export default Checkout;
