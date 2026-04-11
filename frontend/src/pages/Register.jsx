import { useState, useEffect, useRef } from "react";
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
  const [step, setStep] = useState(1);
  const [roleType, setRoleType] = useState("user");

  // Step 1 states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Step 2 states
  const [nationalId, setNationalId] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");


  // Step 3 states
  const [digitalSignature, setDigitalSignature] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [randomImage, setRandomImage] = useState(() => {
    const images = [regImg1, regImg2];
    return images[Math.floor(Math.random() * images.length)];
  });

  useEffect(() => {
    const images = [regImg1, regImg2];
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
  }, [location.pathname, location.key]);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !password) {
        setError(t("All fields are required"));
        return;
      }
      if (roleType === "author") {
        setError("");
        setStep(2);
      } else {
        submitRegistration();
      }
    } else if (step === 2) {
      if (!nationalId || !portfolioLink || !bio || !phoneNumber) {
        setError(t("All author fields are required"));
        return;
      }
      setError("");
      setStep(3);
    }
  };
const getPosition = (e) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
};
  const submitRegistration = async () => {
    setError("");
    setLoading(true);

    const extraData =
      roleType === "author"
        ? {
            roleType,
            nationalId,
            portfolioLink,
            bio,
            phoneNumber,
            digitalSignature,
          }
        : { roleType };

    const result = await register(name, email, password, extraData);

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
    navigate(from, { replace: true });
  };

  const handleGoogleError = (error) => {
    setError(error || "Google registration failed");
  };

  // Canvas Logic
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // نص placeholder
  
const startDrawing = (e) => {
  if (e.cancelable) e.preventDefault();
  setHasDrawn(true);
  const ctx = canvasRef.current.getContext("2d");
  const pos = getPosition(e);

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  setIsDrawing(true);
};

const draw = (e) => {
  if (e.cancelable) e.preventDefault();
  if (!isDrawing) return;

  const ctx = canvasRef.current.getContext("2d");
  const pos = getPosition(e);

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
};

const stopDrawing = (e) => {
  if (e && e.cancelable) e.preventDefault();
  if (!isDrawing) return;
  setIsDrawing(false);
  if (canvasRef.current) {
    setDigitalSignature(canvasRef.current.toDataURL("image/png"));
  }
};

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      setDigitalSignature(null);
      setHasDrawn(false);
    }
  };

  // Initialize canvas style
  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = document.documentElement.classList.contains("dark") ? "#fff" : "#000";
    }
  }, [step]);

  return (
    <div className="auth-page">
      <img src={randomImage} alt="" className="auth-page-icon" />

      <div  style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#818cf8 transparent",
            }} className="auth-container relative max-h-[90vh] overflow-hidden md:max-h-[95vh]">
        <button
          onClick={() => navigate("/", { replace: true })}
          className="touch-area group lg:hidden absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer z-50"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="touch-area group hidden lg:flex items-center gap-2 absolute top-3 left-3 sm:top-4 sm:left-4 p-2 text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer z-50"
          aria-label="Back"
        >
          <ChevronLeftIcon className="h-6 w-6 group-hover:-translate-x-1 group-active:-translate-x-1 transition-transform" />
          {t("Back")}
        </button>

        <div className="text-center mb-5 sm:mb-6 mt-6 md:mt-2">
          <div className="flex justify-center mb-1">
            <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t("Register New Account")}
          </h1>
          <p className="text-gray-600 dark:text-white/80 mt-2 text-sm sm:text-base">
            {(roleType === "author" ? t("Create an account to publish your books") : t("Create an account to buy your favorite books"))}
          </p>
        </div>

        {error && (
          <div
            dir={i18n.dir()}
            className="bg-red-50 dark:bg-red-500/20 border border-red-300 dark:border-red-400/50 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg mb-6"
          >
            {t(error)}
          </div>
        )}

        {step === 1 && (
          <>
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <div className="relative my-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
                <span className="text-sm text-gray-500 dark:text-white/60">
                  {t("Or register with email")}
                </span>
                <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
              </div>
            </div>
          </>
        )}

        <form onSubmit={step === 3 ? (e) => { e.preventDefault(); submitRegistration(); } : handleNextStep} className="space-y-4">
          
          {step === 1 && (
            <>
<div
  dir={i18n.dir()}
  className="flex justify-center gap-2 sm:gap-3 mb-4"
>
  {/* User */}
  <label className="cursor-pointer flex-1 max-w-[120px] sm:max-w-[140px]">
    <input
      type="radio"
      name="roleType"
      value="user"
      checked={roleType === "user"}
      onChange={() => setRoleType("user")}
      className="hidden"
    />

    <div
      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm
      ${
        roleType === "user"
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm"
          : "border-gray-300 dark:border-white/20 hover:border-indigo-400"
      }`}
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 12a5 5 0 100-10 5 5 0 000 10zm-8 9a8 8 0 0116 0H4z"
        />
      </svg>

      <span className="text-gray-700 dark:text-white/90">
        {t("User")}
      </span>
    </div>
  </label>

  {/* Author */}
  <label className="cursor-pointer flex-1 max-w-[120px] sm:max-w-[140px]">
    <input
      type="radio"
      name="roleType"
      value="author"
      checked={roleType === "author"}
      onChange={() => setRoleType("author")}
      className="hidden"
    />

    <div
      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm
      ${
        roleType === "author"
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm"
          : "border-gray-300 dark:border-white/20 hover:border-indigo-400"
      }`}
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"
        />
      </svg>

      <span className="text-gray-700 dark:text-white/90">
        {t("Author")}
      </span>
    </div>
  </label>
</div>
              <div dir={i18n.dir()} className="relative mt-4">
  <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
    
    <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Full Name")}
    </legend>

    <input
    dir="ltr"
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
      placeholder="John Doe"
      required={step === 1}
    />

  </fieldset>
</div>

  <div dir={i18n.dir()} className="relative mt-4">
  <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
    
    <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Email Address")}
    </legend>

<input
  dir="ltr"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="off"
  className="w-full bg-transparent rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 p-2 appearance-none"
  placeholder="example@mail.com"
  required={step === 1}
/>

  </fieldset>
</div>

              <div dir={i18n.dir()} className="relative">
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Password")}
    </legend>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 py-1"
                    placeholder="••••••••"
                    required={step === 1}
                  />
                </fieldset>
                <button
                  type="button"
                  onClick={togglePassword}
                  className={`touch-area absolute ${i18n.dir() === "rtl" ? "left-3" : "right-3"} top-8 cursor-pointer text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white`}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div dir={i18n.dir()}>
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("National ID")}
    </legend>
                  <input
                  dir="ltr"
                    type="text"
                    value={nationalId}
                    placeholder="123456789234567"
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 py-1"
                    required={step === 2}
                  />
                </fieldset>
              </div>

              <div dir={i18n.dir()}>
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Portfolio Link")}
    </legend>
                  <input
                  dir="ltr"
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 py-1"
                    placeholder="https://"
                    required={step === 2}
                  />
                </fieldset>
              </div>

              <div dir={i18n.dir()}>
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Bio")}
    </legend>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("Write a short bio about yourself...")}
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 py-1"
                    rows="3"
                    required={step === 2}
                  />
                </fieldset>
              </div>

              <div dir={i18n.dir()}>
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Phone Number")}
    </legend>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01000000000"
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 py-1"
                    required={step === 2}
                  />
                </fieldset>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div dir={i18n.dir()}>
                <fieldset className="border border-gray-300 dark:border-white/20 rounded-lg px-3 pb-2 pt-3">
                  <legend className="px-1 text-xs text-gray-600 dark:text-white/70">
      {t("Digital Signature")}
    </legend>
    <div className="touch-area relative rounded-lg">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full h-[150px] cursor-crosshair touch-none bg-white dark:bg-zinc-800 rounded-lg"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                   {!hasDrawn && (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400 pointer-events-none">
      {t("Draw your signature")}
    </div>
  )}
                  </div>
                </fieldset>
                
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-sm text-gray-600 dark:text-white/70 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    {t("Clear")}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-1/3 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-zinc-600 transition cursor-pointer"
              >
                {t("Back")}
              </button>
            )}
            <button
              dir={i18n.dir()}
              type="submit"
              disabled={loading || (step === 3 && !digitalSignature)}
              className="touch-area flex-1 bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/30"
            >
              {loading
                ? t("Creating account...")
                : step === 1 && roleType === "author"
                ? t("Next")
                : step === 2
                ? t("Next")
                : t("Register Account")}
            </button>
          </div>
        </form>

        {step === 1 && (
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
        )}

        {step === 1 && (
          <>
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
          </>
        )}
      </div>

      {step === 1 && (
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
      )}
    </div>
  );
};

export default Register;
