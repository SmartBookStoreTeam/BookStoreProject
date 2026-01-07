import { assets } from "../assets/assets";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";
const Footer = () => {
  const { t, i18n } = useTranslation();
  return (
    <div dir={i18n.dir()} className="bg-black text-white py-12">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-bold mb-4">{t("Books")}</h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              {t(
                "booksDelivered",
                "Books Delivered. Imagination Unlimited. Your one-stop destination for all your reading needs."
              )}
              .
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h1 className="text-xl font-semibold mb-4">{t("Quick Links")}</h1>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="touch-area text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                >
                  {t("Home")}
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="touch-area text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                >
                  {t("About Us")}
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="touch-area text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                >
                  {t("Contact")}
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  className="touch-area text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                >
                  {t("All Books")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h1 className="text-xl font-semibold mb-4">{t("Contact")}</h1>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="min-w-[80px]">{t("Email")}:</span>
                <span dir="ltr">samy@gmail.com</span>
              </li>
              <li className="flex items-start">
                <span className="min-w-[80px]">{t("Phone")}:</span>
                <span dir="ltr">+20 10 123 4561</span>
              </li>
              <li className="flex items-start">
                <span className="min-w-[80px]">{t("Address")}:</span>
                <span dir="ltr">MMEC, Mullana - 133207</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h1 className="text-xl font-semibold mb-4">{t("We Accept")}</h1>
            <div className="flex items-center gap-4">
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.visa}
                alt="Visa"
              />
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.mastercard}
                alt="Mastercard"
              />
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.amercanExpress}
                alt="American Express"
              />
              <img
                className="w-11 h-8 object-contain rounded bg-white"
                src={assets.meeza}
                alt="Meeza"
              />
              <img
                className="w-9 h-8 object-contain rounded bg-white"
                src={assets.cash}
                alt="Vodafone Cash"
              />
            </div>

            {/* Social Media (Optional) */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">{t("Follow Us")}</h2>
              <div className="flex items-center gap-4">
                <FaFacebook className="w-8 h-8 fill-[#1877F2] bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
                <FaTwitter className="w-8 h-8 fill-[#1DA1F2]  bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
                <FaLinkedin className="w-8 h-8 fill-[#0077B5] bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
        {/* Country */}
        <div className="flex items-center gap-2 my-5 select-none">
          <div className="flex flex-row items-center" dir="ltr">
            <img className="w-6 h-6" src={assets.eg} alt="Egypt" />
            <button className="touch-area hover:underline focus:underline text-gray-200 cursor-pointer ml-2">
              {t("En")}
            </button>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Books Store. {t("All rights reserved")}
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
