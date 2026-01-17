import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, User, AlertCircle } from "lucide-react";

const CustomerInfoForm = ({ customerInfo, setCustomerInfo }) => {
  const { t, i18n } = useTranslation();
  const [emailTouched, setEmailTouched] = useState(false);

  // Email validation
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCustomerInfo({ ...customerInfo, email });
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const showEmailError =
    emailTouched && customerInfo.email && !isEmailValid(customerInfo.email);

  return (
    <div
      dir={i18n.dir()}
      className="bg-white dark:bg-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-zinc-700"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-700">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("Customer Information")}
        </h2>
      </div>

      <div className="space-y-5">
        {/* Email Field*/}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("Email")} <span className="text-red-500">*</span>
          </label>
          <div className="relative touch-area">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={customerInfo.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder={t("your@email.com")}
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-700 dark:text-gray-100 dark:border-zinc-600 transition-all ${
                showEmailError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400 dark:hover:border-zinc-500"
              }`}
              required
            />
          </div>
          {showEmailError && (
            <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{t("Please enter a valid email address")}</span>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>📧</span>
            <span>{t("Download link will be sent to this email")}</span>
          </p>
        </div>

        {/* Name Field*/}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("Full Name")}{" "}
            <span className="text-gray-400 text-xs font-normal">
              ({t("optional")})
            </span>
          </label>
          <div className="relative touch-area">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, name: e.target.value })
              }
              placeholder={t("Your name")}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-400 dark:hover:border-zinc-500 dark:bg-zinc-700 dark:text-gray-100 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
