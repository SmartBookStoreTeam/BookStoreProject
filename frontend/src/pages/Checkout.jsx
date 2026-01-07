import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import OrderSummary from "../components/OrderSummary";
import CustomerInfoForm from "../components/CustomerInfoForm";
import PaymentMethods from "../components/PaymentMethods";
import TrustSection from "../components/TrustSection";
import { ArrowLeft, Loader } from "lucide-react";
import toast from "react-hot-toast";

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
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to success page with books and customer info
      navigate("/checkout/success", {
        state: {
          books: currentBooks,
          customerInfo,
          paymentMethod: selectedMethod,
        },
      });

      toast.success(t("Payment successful!"), {
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
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("Payment failed. Please try again."), {
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
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentBooks || currentBooks.length === 0) {
    return null;
  }

  const isFormValid = customerInfo.email && isEmailValid(customerInfo.email);

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 py-8 overflow-x-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div dir="ltr" className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="touch-area flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
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
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 text-balance max-w-2xl mx-auto">
            {t(
              "Download link will be sent to your email immediately after payment"
            )}
          </p>
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
              />

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!isFormValid || loading}
                className={`touch-area cursor-pointer w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-700 ${
                  !isFormValid || loading
                    ? "bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
    </div>
  );
};

export default Checkout;
