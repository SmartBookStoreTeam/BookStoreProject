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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some books to your cart to get started!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-600">{getCartItemsCount()} items</span>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 flex items-center space-x-4">
                {/* Book Image */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-20 h-24 object-cover rounded-lg"
                />

                {/* Book Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">by {item.author}</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < item.rate
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-indigo-200 fill-indigo-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-indigo-600 mt-1">
                    ₹{item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Clear Cart
              </button>
              <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium">
                Checkout
              </button>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center w-full mt-4 text-indigo-600 hover:text-indigo-700 transition font-medium"
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
