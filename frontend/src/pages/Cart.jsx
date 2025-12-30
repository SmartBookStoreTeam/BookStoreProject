import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import { assets } from "../assets/assets";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();
  const { t, i18n } = useTranslation();
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 transition-colors">
        <div className="container mx-auto px-6 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            {t("emptyCart", "Your Cart is Empty")}
          </h1>
          <p dir={i18n.dir()} className="text-gray-600 dark:text-gray-400 mb-8">
            {t("emptyCartHint", "Add some books to your cart to get started!")}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t("Continue Shopping")}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 transition-colors"
    >
      <div className="mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="touch-area text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Shopping Cart")}
          </h1>
          <span className="touch-area text-gray-600 dark:text-gray-400">
            {getCartItemsCount()}{" "}
            {getCartItemsCount() === 1 ? t("item") : t("items")}
          </span>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Cart Items */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-zinc-700 divide-y divide-gray-200 dark:divide-zinc-700 h-fit">
            {cartItems.map((item) => (
              <div key={item.id} className=" p-6 flex gap-4 items-center">
                <Link
                  to={`/book/${item._id || item.id}`}
                  className="touch-area"
                >
                  <img
                    src={
                      item.img ||
                      item.image ||
                      (item.images && item.images.length > 0
                        ? item.images[0]?.preview ||
                          item.images[0]?.base64 ||
                          item.images[0]
                        : assets.logo)
                    }
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded hover:opacity-75 transition-opacity cursor-pointer"
                  />
                </Link>

                <div className="flex-1">
                  <Link to={`/book/${item._id || item.id}`}>
                    <h3 className="touch-area font-semibold text-gray-900 dark:text-gray-100 hover:underline focus:underline hover:text-indigo-600 dark:hover:text-indigo-200 focus:text-indigo-600 dark:focus:text-indigo-200 transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    {t("by")}{" "}
                    <span className="touch-area hover:text-indigo-600 dark:hover:text-indigo-200 focus:text-indigo-600 dark:focus:text-indigo-200 transition-colors cursor-pointer">
                      {item.author}
                    </span>
                  </p>

                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < (item.rate || item.rating || item.ratings || 0)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  <p className="touch-area text-lg font-bold text-indigo-600 dark:text-indigo-200 mt-1">
                    ₹{item.price}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="touch-area p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer transition-colors"
                  title={t("Remove from cart")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-zinc-700 p-6">
              <div className="flex justify-between mb-6">
                <span className="touch-area text-xl font-bold text-gray-900 dark:text-gray-200">
                  {t("Total")}:
                </span>
                <span className="touch-area text-2xl font-bold text-indigo-600 dark:text-indigo-200">
                  ₹{getCartTotal().toFixed(2)}
                </span>
              </div>

              {/* Buttons in Column */}
              <div className="flex flex-col gap-3">
                <button className="touch-area w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 cursor-pointer font-medium transition-colors">
                  {t("Checkout")}
                </button>
                <button
                  onClick={clearCart}
                  className="touch-area w-full bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 cursor-pointer font-medium transition-colors"
                >
                  {t("Clear Cart")}
                </button>
                <Link
                  to="/shop"
                  dir="ltr"
                  className="touch-area flex items-center justify-center w-full py-3 text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 cursor-pointer font-medium transition-colors"
                >
                  <ArrowLeft size={18} className="me-2" />
                  {t("Continue Shopping")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
