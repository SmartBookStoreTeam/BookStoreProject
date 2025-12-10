import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeIcon } from "lucide-react";
import {
  BookOpenIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

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
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-[#0f0f14] dark:to-[#11111a] flex items-center justify-center p-4 relative transition-colors">
      {/* Back to Store Button */}
      <div className="max-w-md w-full">
     <div className="bg-white dark:bg-[#1a1a22] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl dark:shadow-2xl p-8 relative">
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome Back
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Password
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
                className="absolute right-3 top-[43px] cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
