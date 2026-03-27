import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import {
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import regImg1 from "../assets/reg_img.png";
import regImg2 from "../assets/reg_img2.png";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user came from to return after registration
  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);

  // Randomly select background image on each navigation
  const [randomImage, setRandomImage] = useState(() => {
    const images = [regImg1, regImg2];
    return images[Math.floor(Math.random() * images.length)];
  });

  // Update image when component mounts or location changes
  useEffect(() => {
    const images = [regImg1, regImg2];
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
  }, [location.pathname, location.key]); // Triggers on any navigation

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate("/verify-email", {
        state: { email },
      });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleSuccess = () => {
    // User registered/logged in with Google, redirect to home
    navigate(from, { replace: true });
  };

  const handleGoogleError = (error) => {
    setError(error || "Google registration failed");
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

        {/* Logo */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="flex justify-center mb-1">
            <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t("Register New Account")}
          </h1>
          <p className="text-gray-600 dark:text-white/80 mt-2 text-sm sm:text-base">
            {t("Create an account to buy your favorite books")}
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

        {/* Google Register Button */}
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
        {/* Divider */}
        <div className="relative my-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
            <span className="text-sm text-gray-500 dark:text-white/60">
              {t("Or register with email")}
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              {t("Full Name")}
            </label>
            <div className="touch-area relative rounded-lg">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-gray-400 dark:placeholder-white/40"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              {t("Email Address")}
            </label>
            <div className="touch-area relative rounded-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-gray-400 dark:placeholder-white/40"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              {t("Password")}
            </label>
            <div className="touch-area relative rounded-lg">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-gray-400 dark:placeholder-white/40 pr-12"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="button"
              onClick={togglePassword}
              className="touch-area absolute right-3 top-10.75 cursor-pointer text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            dir={i18n.dir()}
            type="submit"
            disabled={loading}
            className="touch-area w-full bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/30"
          >
            {loading ? t("Creating account...") : t("Register Account")}
          </button>
        </form>

        {/* Login Link */}
        <div dir={i18n.dir()} className="mt-4 sm:mt-6 text-center">
          <span className="text-sm font-medium text-gray-600 dark:text-white/70">
            {t("Already have an account?")}{" "}
          </span>
          <button
            onClick={() =>
              navigate("/login", {
                state: { from: location.state?.from },
              })
            }
            className="touch-area text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
          >
            {t("Login")}
          </button>
        </div>
        <p
          dir={i18n.dir()}
          className="hidden lg:block mt-6 mb-2 text-gray-500 dark:text-white/50 text-sm text-center z-20"
        >
          {t("Need help? Contact us at")}{" "}
          <a
            className="text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
            href="mailto:bookfly@gmail.com"
          >
            bookfly@gmail.com
          </a>
        </p>
      </div>
      <p
        dir={i18n.dir()}
        className="lg:hidden mt-3 text-gray-500 dark:text-white/50 text-xs sm:text-sm text-center"
      >
        {t("Need help? Contact us at")}{" "}
        <a
          className="text-indigo-600 dark:text-indigo-300 transition-colors duration-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:underline focus:underline font-medium cursor-pointer"
          href="mailto:bookfly@gmail.com"
        >
          bookfly@gmail.com
        </a>
      </p>
    </div>
  );
};

export default Register;
