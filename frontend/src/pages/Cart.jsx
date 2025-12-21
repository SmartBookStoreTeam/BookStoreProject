import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Star,
} from "lucide-react";
import { assets } from "../assets/assets";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
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
          <p className="text-gray-600 dark:text-gray-400 mb-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 transition-colors">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div
          dir={i18n.dir()}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Shopping Cart")}
          </h1>
          <span dir={i18n.dir()} className="text-gray-600 dark:text-gray-400">
            {getCartItemsCount()} {t("items")}
          </span>
        </div>

        {/* Cart Items */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {cartItems.map((item) => (
            <div key={item.id} className="p-6 flex gap-4 items-center">
              <Link to={`/book/${item._id || item.id}`}>
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:underline focus:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {item.author}
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

                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-200 mt-1">
                  ₹{item.price}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2 flex-col sm:flex-row">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-gray-600 dark:text-gray-400">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg shadow border p-6">
          <div dir={i18n.dir()} className="flex justify-between mb-4">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-200">
              {t("Total")}:
            </span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-200">
              ₹{getCartTotal().toFixed(2)}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              {t("Clear Cart")}
            </button>
            <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 cursor-pointer">
              {t("Checkout")}
            </button>
          </div>

          <Link
            to="/shop"
            className="flex items-center justify-center mt-4 text-indigo-600 hover:underline focus:underline dark:text-indigo-400 cursor-pointer"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t("Continue Shopping")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
