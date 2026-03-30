import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { getIslamicOccasion } from "../utils/islamicOccasion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { getMyOrders } from "../api/ordersApi";

const OCCASION_CONTENT = {
  ramadan: {
    badge: "Ramadan Specials 🌙",
    heading: "Ramadan Special — 50% off any book!",
    button: "Grab Your Ramadan Offer Now!",
  },
  eid_fitr: {
    badge: "Eid al-Fitr Offer 🎉",
    heading: "Eid al-Fitr Special — Enjoy 50% off any book!",
    button: "Grab Your Eid Offer Now!",
  },
  eid_adha: {
    badge: "Eid al-Adha Special Offer 🐑",
    heading: "Eid al-Adha Offer — Get 50% off any book!",
    button: "Grab Your Eid Offer Now!",
  },
  default: {
    badge: null,
    heading: "Get 50% off any book!",
    button: "Buy Your First Book Now!",
  },
};

const DiscountOffer = () => {
  const { t, i18n } = useTranslation();
  
  const { user } = useAuth();
  const { purchasedBooks } = useCart();
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkFirstOrder = async () => {
      if (user) {
        try {
          const res = await getMyOrders();
          if (!isMounted) return;
          const hasOrders = Array.isArray(res) && res.length > 0;
          const hasBooksInLibrary = Array.isArray(purchasedBooks) && purchasedBooks.length > 0;
          setIsFirstOrder(!hasOrders && !hasBooksInLibrary);
        } catch {
          if (isMounted) setIsFirstOrder(false);
        }
      } else {
        if (isMounted) setIsFirstOrder(true);
      }
    };
    checkFirstOrder();
    return () => { isMounted = false; };
  }, [user, purchasedBooks]);

  const occasion = getIslamicOccasion() || "default";
  let content = OCCASION_CONTENT[occasion] ?? OCCASION_CONTENT.default;

  if (occasion === "default" && !isFirstOrder) {
    content = {
      badge: null,
      heading: "Wait for our special offers.",
      button: "Buy your favorite books from here!",
    };
  }

  return (
    <div className="bg-yellow-100 dark:bg-zinc-800 transition-colors duration-300 ">
      <div className="w-full max-w-337.5 mx-auto px-4 py-8">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0">
          {/* Text Content */}
          <div dir={i18n.dir()} className="flex-1 text-center md:text-left">
            {content.badge && (
              <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-2 tracking-wide uppercase">
                {t(content.badge)}
              </p>
            )}
            <h1
              dir={i18n.dir()}
              className="text-[24px] md:text-[28px] font-bold mb-6 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            >
              {t(content.heading)}
            </h1>
            <Link dir={i18n.dir()} to={"/shop"} className="touch-area bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg dark:shadow-indigo-900/50 hover:shadow-xl">
              {t(content.button)}
            </Link>
          </div>
          {/* Offer Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src={assets.offer}
              alt="Discount"
              className="w-62.5 h-62.5 md:w-75 md:h-75 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountOffer;
