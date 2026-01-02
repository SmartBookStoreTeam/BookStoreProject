import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
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
        <h2 className="text-2xl font-bold mb-2 text-center">
          Verify your email
        </h2>

        <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mb-6">
          We sent a 6-digit code to <b>{email}</b>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength="6"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full text-center tracking-widest text-2xl py-3 border rounded-lg mb-4 dark:bg-zinc-700"
          placeholder="123456"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
