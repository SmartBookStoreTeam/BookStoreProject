import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const LandingExplore = () => {
  const { t, i18n } = useTranslation();
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = t(
    "LandingExploreParagraph",
    "Find Your Favorite — 1200+ Books Available",
  );

  useEffect(() => {
    // Reset animation when language changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [i18n.language]);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 40); // Speed of typing (50ms per character)

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  return (
    <div className="bg-[#E9D5FF] dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-337.5 mx-auto px-4 py-12">
        <div className="flex items-center dark:bg-gray-900 justify-between md:flex-row flex-col-reverse gap-8 md:gap-0">
          <div className="w-full md:w-1/2">
            <h1
              dir={i18n.dir()}
              className="touch-area text-center lg:whitespace-nowrap text-2xl md:text-3xl text-[#1C2024] dark:text-indigo-100 font-bold mb-6 transition-colors duration-300 min-h-10"
            >
              {displayedText}
              <span className="animate-pulse">|</span>
            </h1>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={assets.landingBooks}
              alt="Books"
              className="touch-area w-62.5 h-62.5 md:w-75 md:h-75 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingExplore;
