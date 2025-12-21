import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className=" flex flex-col justify-center items-center">
        <h1 className="text-[120px] font-bold text-red-500">404</h1>
        <p className="text-4xl text-[#333333] font-bold mb-5">
          {t("Oops! Page Not Found")}
        </p>
        <p className="text-[18px] my-3 w-137.5 text-center">
          {t("pageNotFoundDescription","It seems like you've wandered off the path. The page you're looking for doesn't exist or has been moved.")}
        </p>
        <Link
          to="/"
          className="bg-[#3E63DD] rounded-[7px] cursor-pointer text-white px-5 py-2 flex items-center gap-x-2 mt-5 hover:bg-[#2C4C9D] transition-colors duration-300"
        >
          <Home size={17} />
          {t("Back to Home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
