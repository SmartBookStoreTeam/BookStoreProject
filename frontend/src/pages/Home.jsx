import SellerBooks from "../components/SellerBooks";
import FavoriteBooks from "../components/FavoriteBooks";
import Landing from "../components/Landing";
import NationalBook from "../components/NationalBook";
import Releases from "../components/Releases";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const Home = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Show arrows based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const landingHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const isNearBottom =
        currentScrollY + windowHeight >= documentHeight - 100;
      const isNearTop = currentScrollY < 100;

      // Scrolling down - show scroll to top button
      if (
        currentScrollY > lastScrollY &&
        currentScrollY > landingHeight - 200
      ) {
        setShowScrollTop(true);
        setShowScrollBottom(false);
      }
      // Scrolling up - show scroll to bottom button
      else if (
        currentScrollY < lastScrollY &&
        currentScrollY > landingHeight - 200
      ) {
        setShowScrollTop(false);
        setShowScrollBottom(true);
      }

      // Hide scroll to top when near top
      if (isNearTop) {
        setShowScrollTop(false);
      }

      // Hide scroll to bottom when near bottom
      if (isNearBottom) {
        setShowScrollBottom(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };


  return (
    <>
      {/* Scroll to Top Button - Visible when scrolling down */}
      <div
        className={`fixed bottom-6 z-50 transition-all duration-300 right-6 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="group flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 cursor-pointer"
          title={t("Scroll to Top")}
        >
          <ChevronUp
            size={24}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Scroll to Bottom Button - Visible when scrolling up */}
      <div
        className={`fixed bottom-6 z-50 transition-all duration-300 right-6 ${
          showScrollBottom
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          onClick={() => scrollToSection("releases")}
          className="group flex items-center justify-center w-12 h-12 bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-full shadow-lg transition-all duration-300 cursor-pointer"
          title={t("Scroll to Bottom")}
        >
          <ChevronDown
            size={24}
            className="group-hover:translate-y-0.5 transition-transform"
          />
        </button>
      </div>

      <div>
        <Landing />
        <SellerBooks />
        <FavoriteBooks />
        <NationalBook />
        {/* <UserBooks /> */}
        <Releases />
      </div>
    </>
  );
};

export default Home;
