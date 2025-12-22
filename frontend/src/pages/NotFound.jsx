import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="flex flex-col justify-center items-center max-w-xl w-full">
        {/* 404 Number */}
        <h1 className="text-[80px] sm:text-[100px] md:text-[120px] font-bold text-red-500 dark:text-red-400 leading-none">
          404
        </h1>

        {/* Page Not Found Title */}
        <p className="text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-gray-100 font-bold mb-4 sm:mb-5 text-center transition-colors duration-300">
          {t("Oops! Page Not Found")}
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 my-3 text-center px-4 transition-colors duration-300">
          {t(
            "pageNotFoundDescription",
            "It seems like you've wandered off the path. The page you're looking for doesn't exist or has been moved."
          )}
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="bg-indigo-600 dark:bg-indigo-500 rounded-lg cursor-pointer text-white px-6 py-3 flex items-center gap-x-2 mt-5 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Home size={18} />
          <span className="font-medium">{t("Back to Home")}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
