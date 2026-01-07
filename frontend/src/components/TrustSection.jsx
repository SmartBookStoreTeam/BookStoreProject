import { useTranslation } from "react-i18next";
import { Shield, Lock, RefreshCw } from "lucide-react";
import { assets } from "../assets/assets";

const TrustSection = () => {
  const { t, i18n } = useTranslation();

  return (
    <div
      dir={i18n.dir()}
      className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-700"
    >
      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {t("Secure Payment")}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("100% Protected")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {t("Instant Delivery")}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("PDF via Email or PDF Viewer")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {t("Support")}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("24/7 Available")}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t("We Accept")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <img
            src={assets.visa}
            alt="Visa"
            className="w-13 h-8 object-contain rounded"
          />
          <img
            src={assets.mastercard}
            alt="Mastercard"
            className="w-13 h-8 object-contain rounded"
          />
          <img
            src={assets.amercanExpress}
            alt="American Express"
            className="w-13 h-8 object-contain rounded"
          />
          <img
            src={assets.meeza}
            alt="Meeza"
            className="w-11 h-8 object-contain rounded bg-white"
          />
          <img
            src={assets.cash}
            alt="Vodafone Cash"
            className="w-9 h-8 object-contain rounded bg-white"
          />
        </div>
      </div>

      {/* Refund Policy */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-300">
          ⚠️{" "}
          {t("No refunds after download. Please make sure before purchasing.")}
        </p>
      </div>
    </div>
  );
};

export default TrustSection;
