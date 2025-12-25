import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
const Landing = () => {
  const bookImages = [
    assets.landingBook1,
    assets.landingBook2,
    assets.landingBook3,
    assets.landingBook4,
  ];
  const { t, i18n } = useTranslation();
  const [displayedText, setDisplayedText] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const fullText = t("landingIntro", "Buy and sell your books online");
  const fullText2 = t("landingIntro2", "for the best prices");

  useEffect(() => {
    // Check if animation has already been shown in this session
    const animationShown = sessionStorage.getItem(
      "landingTypingAnimationShown"
    );

    if (animationShown) {
      // If animation was shown before, display text immediately
      setDisplayedText(fullText);
      setDisplayedText2(fullText2);
      setHasAnimated(true);
    } else {
      // First time in session, reset for animation
      setDisplayedText("");
      setDisplayedText2("");
      setCurrentIndex(0);
      setHasAnimated(false);
    }
  }, [i18n.language, fullText, fullText2]);

  useEffect(() => {
    // Only animate if not animated yet
    if (hasAnimated) return;

    //type the first text
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    }
    //type the second text
    else if (currentIndex < fullText.length + fullText2.length) {
      const index2 = currentIndex - fullText.length;
      const timeout = setTimeout(() => {
        setDisplayedText2((prev) => prev + fullText2[index2]);
        setCurrentIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    }
    // Animation completed, mark it in session storage
    else if (currentIndex === fullText.length + fullText2.length) {
      sessionStorage.setItem("landingTypingAnimationShown", "true");
      setHasAnimated(true);
    }
  }, [currentIndex, fullText, fullText2, hasAnimated]);
  return (
    <div className="bg-zinc-200 dark:bg-zinc-900 transition-colors duration-300">
      <section className="relative flex items-center dark:bg-zinc-900  justify-center min-h-screen overflow-hidden">
        <div className="container mx-auto px-6 md:px-20 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            {/* Text Content */}
            <div className="w-full lg:max-w-xl text-center lg:text-left space-y-6 flex flex-col justify-center order-2 lg:order-1">
              <h1 className="relative text-4xl sm:text-5xl lg:text-[56px] font-bold text-indigo-950 dark:text-indigo-100 leading-tight transition-colors duration-300">
                {/* Invisible placeholder to reserve space */}
                <span className="invisible" aria-hidden="true">
                  {fullText}{" "}
                  <span className="text-indigo-500 dark:text-indigo-400">
                    {fullText2}
                  </span>
                </span>

                {/* Visible typing text overlaid on top */}
                <span dir="auto"
                  className="absolute top-0 left-0 right-0 text-center lg:text-left"
                >
                  {displayedText}{" "}
                  <span dir="auto" className="text-indigo-500 dark:text-indigo-400 transition-colors duration-300">
                    {displayedText2}
                  </span>
                </span>
              </h1>

              <p dir="auto" className="text-indigo-950 dark:text-indigo-200 text-base sm:text-lg leading-relaxed transition-colors duration-300">
                {t(
                  "landingParagraph",
                  "Find and read more you'll love, and keep track of the books you want to read. Be part of the world's largest community of book lovers on Goodreads."
                )}
              </p>

              {/* Search bar */}
              <div className="relative flex items-center w-full max-w-md mx-auto lg:mx-0">
                <Search
                  className="absolute left-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={`${t("Search for a book")}...`}
                  dir={i18n.dir()}
                  className="w-full px-10 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-all duration-300"
                />
                <MoreHorizontal
                  className="absolute right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300"
                  size={20}
                />
              </div>
            </div>

            {/* Animated Book Stack */}
            <div className="relative flex items-center justify-center w-full lg:w-[500px] h-[300px] sm:h-[350px] lg:h-[420px] overflow-visible order-1 lg:order-2">
              {bookImages.map((img, i) => {
                const finalRotation = i * 2;
                const finalOffset = i * 25;
                const startX = (i - 1.5) * 160;

                return (
                  <motion.img
                    key={i}
                    src={img}
                    alt={`Book ${i + 1}`}
                    initial={{
                      x: startX,
                      y: 0,
                      rotate: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      x: [startX, 0, finalOffset],
                      y: [0, 0, 0],
                      rotate: [0, 0, finalRotation],
                      scale: [0.9, 1, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                    }}
                    className="absolute w-[180px] h-[260px] sm:w-[220px] sm:h-80 lg:w-[260px] lg:h-[380px] object-cover rounded-xl shadow-lg dark:shadow-zinc-800/50 transition-shadow duration-300"
                    style={{
                      zIndex: bookImages.length - i,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
