import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useCart } from "../hooks/useCart";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-zinc-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag
              size={64}
              className="mx-auto text-gray-400 dark:text-gray-600 mb-6 transition-colors duration-300"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4 transition-colors duration-300">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
              Add some books to your cart to get started!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-300"
              className="inline-flex items-center bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              Shopping Cart
            </h1>
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {getCartItemsCount()} items
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              Shopping Cart
            </h1>
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {getCartItemsCount()} items
            </span>
          </div>

          {/* Cart Items */}
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 divide-y divide-gray-200 dark:divide-zinc-700 transition-colors duration-300">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 flex flex-wrap items-center gap-4 sm:space-x-4">
                {/* Book Image */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-20 h-24 object-cover rounded-lg dark:text-gray-500"
                />

                {/* Book Details */}
                <div className="flex-1">
                     <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    by {item.author}
                  </p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`transition-colors duration-300 ${
                        className={`transition-colors duration-300 ${
                          i < item.rate
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-indigo-200 dark:text-indigo-700 fill-indigo-200 dark:fill-indigo-700"
                            : "text-indigo-200 dark:text-indigo-700 fill-indigo-200 dark:fill-indigo-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 transition-colors duration-300">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 transition-colors duration-300">
                    ₹{item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors duration-300 cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors duration-300 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-300 cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6 transition-colors duration-300">
          <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Total:
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Total:
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium cursor-pointer"
              >
                Clear Cart
              </button>
              <button className="flex-1 bg-indigo-600 dark:bg-indigo-700 text-white py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-300 font-medium cursor-pointer">
                Checkout
              </button>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center w-full mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
              className="inline-flex items-center justify-center w-full mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
            >
              <ArrowLeft size={18} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
