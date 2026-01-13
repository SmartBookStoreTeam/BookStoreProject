import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import GoogleLoginButton from "../components/GoogleLoginButton";
import { EyeIcon } from "lucide-react";
import {
  BookOpenIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import loginImg1 from "../assets/login_img.png";
import loginImg2 from "../assets/login_img2.png";
import loginImg3 from "../assets/login_img3.png";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Get the page user came from to return after login
  const from = location.state?.from?.pathname || "/";

  // Randomly select background image on each navigation
  const [randomImage, setRandomImage] = useState(() => {
    const images = [loginImg1, loginImg2, loginImg3];
    return images[Math.floor(Math.random() * images.length)];
  });

  // Update image when component mounts or location changes
  useEffect(() => {
    const images = [loginImg1, loginImg2, loginImg3];
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
  }, [location.pathname, location.key]); // Triggers on any navigation

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(from, { replace: true }); // Return to original page
  };

  const handleGoogleSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleGoogleError = (error) => {
    setError(error || "Google login failed");
  };

  return (
    <div className="auth-page">
      {/* Floating background icon */}
      <img src={randomImage} alt="" className="auth-page-icon" />

      <div className="auth-container relative">
        {/* Mobile XMark Button - Right Side */}
        <button
          onClick={() => navigate("/", { replace: true })}
          className="touch-area group lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Large Screen Back Button - Left Side */}
        <button
          onClick={() => navigate("/", { replace: true })}
          className="touch-area group hidden lg:flex items-center gap-2 absolute top-3 left-3 sm:top-4 sm:left-4 p-2 text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeftIcon className="h-6 w-6 group-hover:-translate-x-1 group-active:-translate-x-1 transition-transform" />
          {t("Back")}
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-1">
            <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t("Welcome Back")}
          </h1>
          <p className="text-gray-600 dark:text-white/80 mt-2 text-sm sm:text-base">
            {t("Sign in to your account")}
          </p>
        </div>

        {/* Error Box */}
        {error && (
          <div
            dir={i18n.dir()}
            className="bg-red-50 dark:bg-red-500/20 border border-red-300 dark:border-red-400/50 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg mb-6"
          >
            {t(error)}
          </div>
        )}

        {/* Google Login Button */}
        <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
       
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-500 dark:text-white/60">
              {t("Or continue with email")}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              {t("Email Address")}
            </label>
            <div className="touch-area relative rounded-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              {t("Password")}
            </label>
            <div className="touch-area relative rounded-lg">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 pr-12 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="button"
              onClick={togglePassword}
              className="touch-area absolute right-3 top-11 text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white cursor-pointer"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            dir={i18n.dir()}
            type="submit"
            disabled={loading}
            className="touch-area w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-indigo-500/30"
          >
            {loading ? t("Signing in...") : t("Sign In")}
          </button>
        </form>

        <div dir={i18n.dir()} className="mt-6 sm:mt-8 text-center">
          <p className="text-gray-600 dark:text-white/70">
            {t("Don't have an account?")}{" "}
            <button
              onClick={() => navigate("/register")}
              className="touch-area text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
            >
              {t("Sign up")}
            </button>
          </p>
        </div>
        <p
          dir={i18n.dir()}
          className="hidden lg:block mt-6 mb-2 text-gray-500 dark:text-white/50 text-sm text-center z-20"
        >
          {t("Need help? Contact us at")}{" "}
          <a
            className="text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
            href="mailto:bookstore@gmail.com"
          >
            bookstore@gmail.com
          </a>
        </p>
      </div>
      <p
        dir={i18n.dir()}
        className="md:hidden mt-6 text-gray-500 dark:text-white/50 text-xs sm:text-sm text-center"
      >
        {t("Need help? Contact us at")}{" "}
        <a
          className="text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
          href="mailto:bookstore@gmail.com"
        >
          bookstore@gmail.com
        </a>
      </p>
    </div>
  );
};

export default UserLogin;
