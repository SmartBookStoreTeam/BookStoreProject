import { useState, useEffect } from "react";
import { getIslamicOccasion } from "../utils/islamicOccasion";
import { useTranslation } from "react-i18next";
import { X, Moon, Star } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const OccasionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [occasion, setOccasion] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const currentOccasion = getIslamicOccasion();
    if (currentOccasion) {
      const year = new Date().getFullYear();
      const storageKey = `hasSeenGreeting_${currentOccasion}_${year}`;
      
      // Check if user has already seen the greeting this year
      if (!sessionStorage.getItem(storageKey)) {
        setOccasion(currentOccasion);
        setIsOpen(true);
        sessionStorage.setItem(storageKey, "true");
      }
    }
  }, []);

  if (!isOpen || !occasion) return null;

  const isRamadan = occasion === "ramadan";
  
  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-700"
          dir={i18n.dir()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="m-2 cursor-pointer absolute top-3 right-3 z-10 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors bg-white/50 dark:bg-black/20 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 backdrop-blur-md"
            style={{ [i18n.dir() === 'rtl' ? 'left' : 'right']: '12px', right: 'auto' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Header */}
          <div className={`h-32 w-full relative overflow-hidden flex items-center justify-center ${isRamadan ? 'bg-indigo-900' : 'bg-indigo-900'}`}>
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <pattern id="pattern-triangles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0 L40 40 L0 40 Z" fill="currentColor" opacity="0.6" />
                  <path d="M0 0 L20 40 L40 0 Z" fill="currentColor" opacity="0.3" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-triangles)" />
              </svg>
            </div>
            {isRamadan ? (
              <Moon className="w-16 h-16 text-yellow-400 fill-yellow-400 z-10" />
            ) : (
              <Star className="w-16 h-16 text-yellow-300 fill-yellow-300 z-10" />
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-8 text-center">
            <h2 className={`text-3xl font-bold mb-4 ${isRamadan ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {isRamadan ? t("Ramadan Mubarak!") : t("Eid Mubarak!")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              {isRamadan 
                ? t("May this holy month bring you peace, joy, and countless blessings. Happy reading during Ramadan!") 
                : t("Wishing you a joyous and blessed Eid filled with happiness and wonderful stories to read.")}
            </p>
            
            <button
              onClick={handleClose}
              className={`cursor-pointer w-full py-3 px-4 rounded-xl text-white font-medium transition-transform active:scale-95 ${
                isRamadan 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
              } shadow-lg`}
            >
              {t("Continue to Bookfly Store")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OccasionModal;
