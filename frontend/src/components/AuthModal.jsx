import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

const AuthModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-colors duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all transition-colors duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mb-6">
            <ShoppingCart className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("Authentication Required")}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t("Please login or create an account to add books to your cart or publishing your books")}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/user-login"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300 ease-in-out"
              onClick={onClose}
            >
              {t("Login")}
            </Link>

            <Link
              to="/register"
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors duration-300 ease-in-out"
              onClick={onClose}
            >
              {t("Create Account")}
            </Link>

            <button
              onClick={onClose}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium py-2 cursor-pointer transition-colors duration-300 ease-in-out"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
