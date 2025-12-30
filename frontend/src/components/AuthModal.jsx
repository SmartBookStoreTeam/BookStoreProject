import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
const AuthModal = ({ isOpen, onClose, title, icon }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLoginClick = () => {
    navigate("/user-login", { state: { from: location } });
  };
  const handleSignupClick = () => {
    navigate("/register", { state: { from: location } });
  };
  if (!isOpen) return null;

  return (
    <div
      dir={i18n.dir()}
      className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-colors duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all transition-colors duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mb-6">{icon}</div>

          <h2 className="touch-area text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("Authentication Required")}
          </h2>

          <p className="touch-area text-gray-600 dark:text-gray-300 mb-8">{t(title)}</p>

          <div className="flex flex-col gap-3">
            <button
              className="touch-area w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer transition-colors duration-300 ease-in-out"
              onClick={handleLoginClick}
            >
              {t("Login")}
            </button>

            <button
              className="touch-area w-full bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-xl cursor-pointer transition-colors duration-300 ease-in-out"
              onClick={handleSignupClick}
            >
              {t("Create Account")}
            </button>

            <button
              onClick={onClose}
              className="touch-area w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium py-2 cursor-pointer transition-colors duration-300 ease-in-out"
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
