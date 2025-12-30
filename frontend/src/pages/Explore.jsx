import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  Star,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import LandingExplore from "../components/LandingExplore";
import Popular from "../components/Popular";
import Releases from "../components/Releases";
import Suggestion from "../components/Suggestion";
import TopRated from "../components/TopRated";

const Explore = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const sections = useMemo(
    () => [
      { id: "releases", label: "New Releases", icon: Sparkles },
      { id: "top-rated", label: "Top Rated", icon: Star },
      { id: "suggestions", label: "Suggestions", icon: Lightbulb },
      { id: "popular", label: "Popular", icon: TrendingUp },
    ],
    []
  );

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 400);

      // Determine active section
      const sectionElements = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Scroll to section with offset for header
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

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Side Navigation */}
      <nav
        className={`fixed top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2 left-4`}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white scale-110"
                  : "bg-white/80 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105"
              }`}
              title={section.label}
            >
              <Icon size={20} />
              {/* Tooltip */}
              <span
                className={`absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none`}
              >
                {t(section.label)}
              </span>
            </button>
          );
        })}

        {/* Scroll indicator line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-700 -z-10 rounded-full" />
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex md:hidden gap-2 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-full shadow-xl border border-gray-200 dark:border-zinc-700 transition-all duration-300 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              }`}
              title={section.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>

      {/* Scroll to Top / Bottom Buttons */}
      <div
        className={`fixed bottom-6 z-50 flex flex-col gap-2 right-6`}
      >
        {/* Scroll to Top */}
        <button
          onClick={scrollToTop}
          className={`group flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
            showScrollTop
              ? "translate-y-0 opacity-100"
              : "translate-y-16 opacity-0 pointer-events-none"
          }`}
          title={t("Scroll to Top")}
        >
          <ChevronUp
            size={24}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
        </button>

        {/* Scroll to Bottom (visible when at top) */}
        <button
          onClick={() => scrollToSection("popular")}
          className={`group flex items-center justify-center w-12 h-12 bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
            !showScrollTop
              ? "translate-y-0 opacity-100"
              : "-translate-y-16 opacity-0 pointer-events-none"
          }`}
          title={t("Scroll to Bottom")}
        >
          <ChevronDown
            size={24}
            className="group-hover:translate-y-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Main Content */}
      <LandingExplore />
      <Releases />
      <TopRated />
      <Suggestion />
      <Popular />
    </div>
  );
};

export default Explore;
