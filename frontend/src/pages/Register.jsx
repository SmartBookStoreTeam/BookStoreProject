import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const {t}=useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate("/user-login");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-[#0f0f14] dark:to-[#11111a] flex items-center justify-center p-4 transition-colors relative">
      {/* Back to Store Button */}
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-[#1a1a22] rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700 transition-colors relative">
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-zinc-100">
              {t("Register New Account")}
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-2">
              {t("Create an account to access the dashboard")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Box */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("Full Name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("Email Address")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="example@mail.com"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t("Password")}
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-12"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-10.75 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
            dir="auto"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t("Creating account...") : t("Register Account")}
            </button>
          </form>

          {/* Login Link */}
          <div dir="auto" className="mt-6 text-center">
            <span className="text-sm font-medium text-gray-800 dark:text-zinc-300">
              {t("Already have an account?")}{" "}
            </span>
            <button
              onClick={() => navigate("/user-login")}
              className="text-indigo-600 dark:text-indigo-400 transition-colors duration-300 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline focus:underline font-medium cursor-pointer"
            >
              {t("Login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;