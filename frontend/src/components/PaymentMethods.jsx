import { useTranslation } from "react-i18next";
import { CreditCard, Wallet, Info } from "lucide-react";

const PaymentMethods = ({ selectedMethod, setSelectedMethod }) => {
  const { t, i18n } = useTranslation();

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express, Meeza",
    },
    {
      id: "vodafone",
      name: "Vodafone Cash",
      icon: Wallet,
      description: "We will contact you to complete payment",
      tooltip: "Payment instructions will be sent via WhatsApp",
    },
    {
      id: "instapay",
      name: "Instapay",
      icon: Wallet,
      description: "We will contact you to complete payment",
      tooltip: "Payment instructions will be sent via WhatsApp",
    },
  ];

  return (
    <div
      dir={i18n.dir()}
      className="bg-white dark:bg-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-zinc-700"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-700">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("Payment Method")}
        </h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <label
              key={method.id}
              className={`touch-area flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-indigo-600 dark:border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 shadow-md"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm"
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={isSelected}
                onChange={() => setSelectedMethod(method.id)}
                className="mt-1 w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {t(method.name)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(method.description)}
                </p>

                {/* Tooltip for wallet methods */}
                {method.tooltip && isSelected && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-blue-800 dark:text-blue-300">
                      {t(method.tooltip)}
                    </span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethods;
