import { navLinks } from "../assets/assets";
import { ShoppingCart, Menu, X, User } from "lucide-react"; // User icon for register
import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
const Header = () => {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };
  const links = navLinks;

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
  const firstLetter = firstName?.charAt(0)?.toUpperCase();
  const profileRef = useRef(null);
  const toggleSettings = () => setOpenSettings(!openSettings);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const [openDropdown, setOpenDropdown] = useState(false);
  const settingsRef = useRef(null);
  const menuRef = useRef(null);
  const toggleDropdown = () => setOpenDropdown(!openDropdown);
  const closeDropdown = () => setOpenDropdown(false);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setOpenSettings(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-200 dark:bg-zinc-900 shadow-sm dark:shadow-zinc-800 z-50 border-b border-zinc-300 dark:border-zinc-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-indigo-950 dark:text-indigo-200 text-2xl font-bold tracking-tight"
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
                  >
                    {icon && getIcon(icon, 18)}
                    <span>{t(label)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {/* Cart */}
            <Link to="/cart" className="relative">
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
            <div className="relative hidden md:flex">
              <button
                onClick={toggleSettings}
                className="p-2 rounded-full bg-zinc-300 dark:bg-zinc-700 text-indigo-900 focus:rotate-180 transition duration-300 dark:text-indigo-200 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition cursor-pointer"
              >
                <Settings size={20} />
              </button>

              {/* Dropdown */}
              {openSettings && (
                <div
                  ref={settingsRef}
                  className="absolute right-0 mt-13 w-50 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-2 z-50"
                >
                  {/* Dark Mode */}
                  <div
                    onClick={toggleTheme}
                    className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition duration-300"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "light" ? (
                        <Sun
                          className="text-indigo-950 dark:text-zinc-200"
                          size={18}
                        />
                      ) : (
                        <Moon
                          className="text-indigo-950 dark:text-zinc-200"
                          size={18}
                        />
                      )}
                      <span className="font-medium text-indigo-950 dark:text-zinc-200">
                        {t("Dark Mode")}
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        theme === "dark"
                          ? "bg-indigo-500 dark:bg-indigo-400"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          theme === "dark" ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div
                    onClick={toggleLanguage}
                    className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <Languages
                        className="text-indigo-950 dark:text-zinc-200"
                        size={18}
                      />
                      <span className="font-medium text-indigo-950 dark:text-zinc-200">
                        {t("Language")}
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        i18n.language === "ar"
                          ? "bg-indigo-500 dark:bg-indigo-400"
                          : "bg-indigo-500 dark:bg-indigo-400"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white text-[10px] font-bold text-indigo-600 transition-transform pointer-events-none ${
                          i18n.language === "ar"
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      >
                        {i18n.language === "ar" ? "AR" : "EN"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Register */}
            {!user ? (
              <Link
                to="/register"
                className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
              >
                <User size={24} />
                {t("Register")}
              </Link>
            ) : (
              <div className="relative flex items-center gap-2">
                {/* Avatar + Name */}
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full
             bg-indigo-500 dark:bg-indigo-400
             text-white dark:text-zinc-900
             hover:bg-indigo-700 dark:hover:bg-indigo-600
             hover:text-white dark:hover:text-white
             border border-indigo-600
             hover:scale-110 hover:shadow-lg
             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
             flex items-center justify-center font-semibold
             transition duration-300"
                >
                  {firstLetter}
                </Link>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  {firstName}
                </button>

                {/* Dropdown */}
                {openDropdown && (
                  <div ref={profileRef} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-12 w-40 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-2 z-50">
                    <Link
                      to="/profile"
                      onClick={closeDropdown}
                      className="block px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-white"
                    >
                      {t("Profile")}
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        closeDropdown();
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-red-500 font-bold cursor-pointer"
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
            <Link to="/cart" className="relative" onClick={closeMenu}>
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
              className="text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`md:hidden fixed top-0 left-0 w-3/4 max-w-xs bg-zinc-200 dark:bg-zinc-900 h-full p-6 border-r border-zinc-300 dark:border-zinc-700 transform transition-transform duration-300 z-40 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 text-indigo-950 dark:text-indigo-200 text-xl font-bold tracking-tight mb-6 pb-4 border-b border-zinc-300 dark:border-zinc-700"
          >
            <span>{t("Books")}</span>
          </Link>

          <ul className="flex flex-col gap-4 text-indigo-950 dark:text-zinc-200 font-medium">
            {links.map(({ label, to, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-4 rounded-lg transition-colors ${
                      isActive
                        ? "text-indigo-500 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`
                  }
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
                onClick={closeMenu}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                    isActive
                      ? "text-indigo-500 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  }`
                }
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
                className="flex items-center justify-between relative py-2 px-4 cursor-pointer rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
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
                    theme === "dark"
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform pointer-events-none ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </li>
            {/* Language */}
            <li>
              <div
                onClick={toggleLanguage}
                className="flex items-center justify-between relative py-2 px-4 cursor-pointer rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <Languages size={18} />
                <span className="text-indigo-950 dark:text-zinc-200 font-medium absolute left-11">
                  {" "}
                  {t("Language")}{" "}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLanguage();
                  }}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer ${
                    i18n.language === "en"
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-indigo-500 dark:bg-indigo-400"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white text-[10px] font-bold text-indigo-600 transition-transform pointer-events-none ${
                      i18n.language === "ar" ? "translate-x-6" : "translate-x-1"
                    }`}
                  >
                    {i18n.language === "ar" ? "AR" : "EN"}
                  </span>
                </button>
              </div>
            </li>
            {/* Register */}
            <li>
              {!user ? (
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                  <User size={18} /> {t("Register")}
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-400 text-white dark:text-zinc-900 flex items-center justify-center font-semibold">
                      {firstLetter}
                    </div>
                    {firstName}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700 text-left"
                  >
                    {t("Logout")}
                  </button>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
