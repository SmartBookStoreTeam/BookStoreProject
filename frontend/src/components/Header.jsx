import { navLinks } from "../assets/assets";
import { ShoppingCart, Menu, X, User } from "lucide-react"; // User icon for register
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import {
  Sun,
  Moon,
  Languages,
  Settings,
  Home,
  Compass,
  Store,
  Users,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigation } from "../context/NavigationContext";
import { useGlobalLoading } from "../context/LoadingContext";

import UserAvatar from "../components/UserAvatar";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigation();
  const { isLoading } = useGlobalLoading();
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulsing effect when loading takes too long
  useEffect(() => {
    if (!isLoading) {
      setIsPulsing(false);
      return;
    }

    const pulseTimer = setTimeout(() => {
      setIsPulsing(true);
    }, 300);

    return () => {
      clearTimeout(pulseTimer);
    };
  }, [isLoading]);

  const links = navLinks;

  //prevent context menu only on mobile/touch devices
  const handleContextMenu = (e) => {
    // Prevent context menu on small screens (mobile/tablet)
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      e.preventDefault();
    }
    // Allow context menu on desktop (larger screens)
  };

  // Safe navigation handler - checks if navigation is blocked
  const handleSafeNavigation = (e, to, callback) => {
    e.preventDefault();
    const allowed = requestNavigation(to);
    if (allowed) {
      if (callback) callback();
      navigate(to);
    }
  };

  // Icon mapping
  const getIcon = (iconName, size = 18) => {
    const icons = { Home, Compass, Store, Users, Upload };
    const IconComponent = icons[iconName];
    return IconComponent ? (
      <IconComponent className="md:hidden xl:block" size={size} />
    ) : null;
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [openSettings, setOpenSettings] = useState(false);

  const firstName = user?.name?.split(" ")[0];

  const profileRef = useRef(null);
  const toggleSettings = () => setOpenSettings(!openSettings);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openLanguageDropdown, setOpenLanguageDropdown] = useState(false);
  const settingsRef = useRef(null);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const languageRef = useRef(null);
  const mobileLanguageRef = useRef(null);
  const toggleDropdown = () => setOpenDropdown(!openDropdown);
  const closeDropdown = () => setOpenDropdown(false);
  const toggleLanguageDropdown = () =>
    setOpenLanguageDropdown(!openLanguageDropdown);
  const closeLanguageDropdown = () => setOpenLanguageDropdown(false);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  // Helper function to check if dark mode is actually active
  const isDarkModeActive = () => {
    if (theme === "dark") return true;
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setOpenSettings(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
      const clickedInsideDesktop =
        languageRef.current && languageRef.current.contains(event.target);
      const clickedInsideMobile =
        mobileLanguageRef.current &&
        mobileLanguageRef.current.contains(event.target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setOpenLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-200 dark:bg-zinc-900 shadow-sm dark:shadow-zinc-800 z-50 border-b border-zinc-300 dark:border-zinc-700">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleSafeNavigation(e, "/")}
            className="touch-area flex items-center gap-3 text-indigo-950 dark:text-indigo-200 text-2xl font-bold tracking-tight"
            onContextMenu={handleContextMenu}
          >
            <span>{t("Books")}</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-4 md:gap-3 lg:gap-6 text-indigo-950 dark:text-zinc-200 font-medium">
              {links.map(({ label, to, icon }) => (
                <li key={to} className="relative">
                  <NavLink
                    to={to}
                    onClick={(e) => handleSafeNavigation(e, to)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 relative pb-1 after:absolute after:left-0 after:bottom-0 
                  after:h-0.5 after:w-full after:bg-indigo-500 
                  after:transition-transform after:duration-300 after:scale-x-0 
                  hover:after:scale-x-100 after:origin-right hover:after:origin-left
                  ${
                    isActive
                      ? "text-indigo-500 dark:text-indigo-400 font-semibold after:scale-x-100"
                      : "hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`
                    }
                    onContextMenu={handleContextMenu}
                  >
                    {icon && getIcon(icon, 18)}
                    <span>{t(label)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {/* Cart */}
            <Link
              to="/cart"
              onClick={(e) => handleSafeNavigation(e, "/cart")}
              className="relative"
              onContextMenu={handleContextMenu}
            >
              <ShoppingCart
                size={24}
                className="text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer"
              />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 dark:bg-indigo-400 text-white dark:text-zinc-900 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            {/* Settings preferance */}
            <div
              dir="auto"
              className="relative hidden md:flex"
              ref={settingsRef}
            >
              <button
                onClick={toggleSettings}
                className={`p-2 rounded-full bg-zinc-300 dark:bg-zinc-700 text-indigo-900 transition duration-300 dark:text-indigo-200 hover:bg-zinc-400 dark:hover:bg-zinc-600 cursor-pointer ${
                  openSettings ? "rotate-180 dark:text-indigo-400" : "rotate-0"
                }`}
              >
                <Settings size={20} />
              </button>

              {/* Dropdown */}
              {openSettings && (
                <div className="absolute right-0 mt-13 w-56 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-2 z-50">
                  {/* Dark Mode */}
                  <div
                    onClick={toggleTheme}
                    className="group flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition duration-300"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "light" ? (
                        <Sun
                          className="text-indigo-950 dark:text-zinc-200 group-hover:rotate-360 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                          size={18}
                        />
                      ) : (
                        <Moon
                          className="text-indigo-950 dark:text-zinc-200 group-hover:scale-125 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                          size={18}
                        />
                      )}
                      <span className="font-medium text-indigo-950 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300 whitespace-nowrap">
                        {t("Dark Mode")}
                      </span>
                    </div>
                    <div
                      dir="ltr"
                      className={`relative inline-flex h-5 w-10 ms-3 items-center rounded-full bg-zinc-300 transition-colors group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400${
                        isDarkModeActive()
                          ? "bg-indigo-500 dark:bg-indigo-400"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform group-hover:scale-125 ${
                          isDarkModeActive() ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="touch-area relative" ref={languageRef}>
                    <div
                      onClick={toggleLanguageDropdown}
                      className="group flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <Languages
                          className="text-indigo-950 dark:text-zinc-200 group-hover:scale-125 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                          size={18}
                        />
                        <span className="font-medium text-indigo-950 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300 whitespace-nowrap">
                          {t("Language")}
                        </span>
                      </div>
                      <div
                        dir="ltr"
                        className="relative inline-flex items-center gap-0.5 -ms-3 min-w-[60px] justify-end"
                      >
                        <div className="text-indigo-950 dark:text-zinc-200 text-xs font-semibold relative h-4 w-14 flex items-center justify-end">
                          <span
                            className={`text-indigo-500 dark:text-indigo-200 absolute right-0 transition-all duration-500 ease-in-out transform-gpu ${
                              i18n.language === "en"
                                ? "translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0"
                                : "-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                            }`}
                          >
                            English
                          </span>
                          <span
                            className={`text-in absolute right-0 transition-all duration-500 ease-in-out transform-gpu ${
                              i18n.language === "ar"
                                ? "translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0"
                                : "-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                            }`}
                          >
                            عربي
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          className="text-indigo-950 dark:text-zinc-200 group-hover:translate-y-1 transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Language Dropdown */}
                    {openLanguageDropdown && (
                      <div className="absolute left-0 mt-1 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg overflow-hidden z-50">
                        <div
                          onClick={() => {
                            i18n.changeLanguage("en");
                            localStorage.setItem("language", "en");
                            closeLanguageDropdown();
                          }}
                          className={`flex items-center justify-between py-2 px-3 cursor-pointer transition duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                            i18n.language === "en"
                              ? "bg-indigo-100 dark:bg-indigo-900/30"
                              : ""
                          }`}
                        >
                          <span className="text-sm font-medium text-indigo-950 dark:text-zinc-200">
                            English
                          </span>
                          {i18n.language === "en" && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                          )}
                        </div>
                        <div
                          onClick={() => {
                            i18n.changeLanguage("ar");
                            localStorage.setItem("language", "ar");
                            closeLanguageDropdown();
                          }}
                          className={`flex items-center justify-between py-2 px-3 cursor-pointer transition duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                            i18n.language === "ar"
                              ? "bg-indigo-100 dark:bg-indigo-900/30"
                              : ""
                          }`}
                        >
                          <span className="text-sm font-medium text-indigo-950 dark:text-zinc-200">
                            عربي
                          </span>
                          {i18n.language === "ar" && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Register */}
            {!user ? (
              <Link
                to="/register"
                onClick={(e) => handleSafeNavigation(e, "/register")}
                className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                onContextMenu={handleContextMenu}
              >
                <User size={24} />
                {t("Register")}
              </Link>
            ) : (
              <div
                className="relative flex items-center gap-2"
                ref={profileRef}
              >
                {/* Avatar + Name */}
                <Link
                  to="/profile"
                  onClick={(e) => handleSafeNavigation(e, "/profile")}
                  className="hover:scale-110 transition"
                >
                  <UserAvatar user={user} size={32} className="shadow-md" />
                </Link>

                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  {firstName}
                </button>

                {/* Dropdown */}
                {openDropdown && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-12 w-40 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-2 z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={(e) => {
                        handleSafeNavigation(e, "/profile", closeDropdown);
                      }}
                      className="block px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-white"
                      onContextMenu={handleContextMenu}
                    >
                      {t("Profile")}
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        closeDropdown();
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-red-500 font-bold cursor-pointer"
                    >
                      {t("Logout")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Cart + Menu */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Cart */}
            <Link
              to="/cart"
              className="relative touch-area"
              onClick={closeMenu}
              onContextMenu={handleContextMenu}
            >
              <ShoppingCart
                size={24}
                className="text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer"
              />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 dark:bg-indigo-400 text-white dark:text-zinc-900 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Menu Toggle */}
            <button
              ref={menuRef}
              onClick={toggleMenu}
              className="touch-area text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          ref={sidebarRef}
          className={`md:hidden fixed top-0 left-0 w-3/4 max-w-xs bg-zinc-200 dark:bg-zinc-900 h-full p-6 border-r border-zinc-300 dark:border-zinc-700 transform transition-transform duration-300 z-40 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            onClick={(e) => handleSafeNavigation(e, "/", closeMenu)}
            className="touch-area flex items-center gap-3 text-indigo-950 dark:text-indigo-200 text-xl font-bold tracking-tight mb-6 pb-4 border-b border-zinc-300 dark:border-zinc-700"
            onContextMenu={handleContextMenu}
          >
            <span>{t("Books")}</span>
          </Link>

          <ul className="flex flex-col gap-4 text-indigo-950 dark:text-zinc-200 font-medium">
            {links.map(({ label, to, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={(e) => handleSafeNavigation(e, to, closeMenu)}
                  className={({ isActive }) =>
                    `touch-area flex items-center gap-3 py-2 px-4 rounded-lg transition-colors ${
                      isActive
                        ? "text-indigo-500 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`
                  }
                  onContextMenu={handleContextMenu}
                >
                  {icon && getIcon(icon, 18)}
                  <span>{t(label)}</span>
                </NavLink>
              </li>
            ))}
            {/* Mobile Cart */}
            <li>
              <NavLink
                to="/cart"
                onClick={(e) => handleSafeNavigation(e, "/cart", closeMenu)}
                className={({ isActive }) =>
                  `touch-area relative flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                    isActive
                      ? "text-indigo-500 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  }`
                }
                onContextMenu={handleContextMenu}
              >
                <ShoppingCart size={18} />
                <span>{t("Cart")}</span>

                {getCartItemsCount() > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                    {getCartItemsCount()}
                  </span>
                )}
              </NavLink>
            </li>
            {/* Dark Mode */}
            <li>
              <div
                onClick={toggleTheme}
                className="touch-area flex items-center justify-between relative py-2 px-4 cursor-pointer rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <Moon size={18} />
                <span className="text-indigo-950 dark:text-zinc-200 font-medium absolute left-11">
                  {" "}
                  {t("Dark Mode")}{" "}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer ${
                    isDarkModeActive()
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform pointer-events-none ${
                      isDarkModeActive() ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </li>
            {/* Register */}
            <li>
              {!user ? (
                <Link
                  to="/register"
                  onClick={(e) =>
                    handleSafeNavigation(e, "/register", closeMenu)
                  }
                  className="touch-area flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  onContextMenu={handleContextMenu}
                >
                  <User size={18} /> {t("Register")}
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={(e) =>
                      handleSafeNavigation(e, "/profile", closeMenu)
                    }
                    className="touch-area flex items-center gap-3 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    onContextMenu={handleContextMenu}
                  >
                    <UserAvatar user={user} size={32} className="shadow-md" />

                    {firstName}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="touch-area flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-left"
                  >
                    {t("Logout")}
                  </button>
                </>
              )}
            </li>
          </ul>

          {/* Language - Fixed at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="relative" ref={mobileLanguageRef}>
              <div
                onClick={toggleLanguageDropdown}
                className="active:bg-zinc-300 dark:active:bg-zinc-800 group flex items-center justify-between relative px-4 py-2 mb-2 cursor-pointer rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <Languages
                    className="text-indigo-950 dark:text-zinc-200"
                    size={18}
                  />
                  <span className="text-indigo-950 dark:text-zinc-200 font-medium">
                    {t("Language")}
                  </span>
                </div>
                <div
                  dir="ltr"
                  className="relative inline-flex items-center gap-0.5 ms-3 min-w-[70px] justify-end"
                >
                  <div className="text-indigo-950 dark:text-zinc-200 text-xs font-semibold relative h-4 w-14 flex items-center justify-end">
                    <span
                      className={`text-indigo-500 dark:text-indigo-200 absolute right-0 transition-all duration-500 ease-in-out transform-gpu ${
                        i18n.language === "en"
                          ? "translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0"
                          : "-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                      }`}
                    >
                      English
                    </span>
                    <span
                      className={`text-indigo-500 dark:text-indigo-200 absolute right-0 transition-all duration-500 ease-in-out transform-gpu ${
                        i18n.language === "ar"
                          ? "translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0"
                          : "-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                      }`}
                    >
                      عربي
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-indigo-950 dark:text-zinc-200 group-hover:translate-y-1 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Mobile Language Dropdown */}
              {openLanguageDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg overflow-hidden">
                  <div
                    onClick={() => {
                      i18n.changeLanguage("en");
                      localStorage.setItem("language", "en");
                      closeLanguageDropdown();
                    }}
                    className={`touch-area flex items-center justify-between py-2 px-3 cursor-pointer transition duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      i18n.language === "en"
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-indigo-950 dark:text-zinc-200">
                      English
                    </span>
                    {i18n.language === "en" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                    )}
                  </div>
                  <div
                    onClick={() => {
                      i18n.changeLanguage("ar");
                      localStorage.setItem("language", "ar");
                      closeLanguageDropdown();
                    }}
                    className={`touch-area flex items-center justify-between py-2 px-3 cursor-pointer transition duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      i18n.language === "ar"
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-indigo-950 dark:text-zinc-200">
                      عربي
                    </span>
                    {i18n.language === "ar" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      <div
        className={`absolute bottom-0 h-[2px] transition-all duration-300 overflow-hidden ${
          isLoading ? "w-full opacity-100" : "w-0 opacity-0"
        } left-0`}
        style={{
          background: "linear-gradient(to left, #6366f1, #6366f1, #6366f1)",
          boxShadow: isPulsing
            ? "0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)"
            : isLoading
            ? "0 0 10px rgba(99, 102, 241, 0.5)"
            : "none",
        }}
      >
        {/* Moving wave effect */}
        {isPulsing && (
          <div
            className={"animate-wave-ltr"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
              backgroundSize: "50% 100%",
            }}
          />
        )}
      </div>
    </header>
  );
};
export default Header;
