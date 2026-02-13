import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const email = location.state?.email;

  if (!email) {
    navigate("/register");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyEmail(email, code);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <div className="flex justify-end mb-4">
          <button
            className="touch-area text-sm text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-gray-100/10 p-1 rounded-full transition-colors cursor-pointer"
            type="button"
            onClick={() => navigate("/register")}
          >
            <X />
          </button>
        </div>
        <h2
          dir="auto"
          className="text-2xl text-zinc-900 dark:text-white font-bold mb-2 text-center"
        >
          {t("Verify your email")}
        </h2>

        <p
          dir="auto"
          className="text-sm text-gray-600 dark:text-zinc-400 text-center mb-6"
        >
          {t("We sent a 6-digit code to")} <b>{email}</b>
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-white p-2 rounded mb-4">
            {t(error)}
          </div>
        )}

        <input
          type="text"
          maxLength="6"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full text-center tracking-widest placeholder:text-gray-600/20 dark:placeholder:text-white/20 text-2xl text-gray-600 dark:text-white py-3 border rounded-lg mb-4 dark:bg-zinc-700"
          placeholder="123456"
          required
        />

        <button
          dir="auto"
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? t("Verifying...") : t("Verify")}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
