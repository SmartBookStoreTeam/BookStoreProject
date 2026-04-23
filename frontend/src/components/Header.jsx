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
  Bell,
} from "lucide-react";
import { FaMoon } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigation } from "../context/NavigationContext";
import { useGlobalLoading } from "../context/LoadingContext";
import { useNotifications } from "../context/NotificationContext";

import UserAvatar from "../components/UserAvatar";
import { getIslamicOccasion } from "../utils/islamicOccasion";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigation();
  const { isLoading } = useGlobalLoading();
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { theme, setTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const links = navLinks.filter((link) => {
    if (link.to === "/author-dashboard/add-book") {
      return user?.role === "author";
    }
    return true;
  });

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
  const [openSettings, setOpenSettings] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const firstName = user?.name?.split(" ")[0];

  const profileRef = useRef(null);
  const toggleSettings = () => setOpenSettings(!openSettings);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openLanguageDropdown, setOpenLanguageDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false); // scrolling down
        } else {
          setIsVisible(true); // scrolling up
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const settingsRef = useRef(null);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const languageRef = useRef(null);
  const mobileLanguageRef = useRef(null);
  const notificationsRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const mobileNotificationsDropdownRef = useRef(null);
  const mobileNotificationsRef = useRef(null);
  const toggleDropdown = () => setOpenDropdown(!openDropdown);
  const closeDropdown = () => setOpenDropdown(false);
  const toggleLanguageDropdown = () =>
    setOpenLanguageDropdown(!openLanguageDropdown);
  const closeLanguageDropdown = () => setOpenLanguageDropdown(false);
  const toggleNotifications = () => setOpenNotifications(!openNotifications);
  const closeNotifications = () => setOpenNotifications(false);

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
      const clickedInsideNotifications =
        (notificationsRef.current &&
          notificationsRef.current.contains(event.target)) ||
        (notificationsDropdownRef.current &&
          notificationsDropdownRef.current.contains(event.target)) ||
        (mobileNotificationsRef.current &&
          mobileNotificationsRef.current.contains(event.target)) ||
        (mobileNotificationsDropdownRef.current &&
          mobileNotificationsDropdownRef.current.contains(event.target));

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setOpenLanguageDropdown(false);
      }
      if (!clickedInsideNotifications) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const occasion = getIslamicOccasion();

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full shadow-sm dark:shadow-zinc-900/50 z-50 border-b transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } bg-indigo-900/90 dark:bg-zinc-900/20 backdrop-blur-md border-indigo-800/50 dark:border-zinc-800`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none text-white/[0.07] dark:text-white/[0.05]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="pattern-triangles"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0 L40 40 L0 40 Z"
                fill="currentColor"
                opacity="0.6"
              />
              <path d="M0 0 L20 40 L40 0 Z" fill="currentColor" opacity="0.3" />
            </pattern>
            <pattern
              id="pattern-books"
              x="0"
              y="0"
              width="120"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Subtle Shelf Line */}
                <line
                  x1="0"
                  y1="38"
                  x2="120"
                  y2="38"
                  strokeWidth="1"
                  opacity="0.2"
                />

                {/* Standing Books */}
                <rect x="6" y="14" width="8" height="24" rx="1" />
                <line x1="10" y1="16" x2="10" y2="36" opacity="0.4" />

                <rect x="16" y="20" width="6" height="18" rx="1" />

                {/* Leaning Book */}
                <g transform="translate(26, 38) rotate(18) translate(-26, -38)">
                  <rect x="26" y="14" width="9" height="24" rx="1" />
                  <line x1="30" y1="16" x2="30" y2="36" opacity="0.4" />
                </g>

                {/* Stacked Horizontal Books */}
                <rect x="44" y="30" width="22" height="8" rx="1" />
                <line x1="46" y1="34" x2="64" y2="34" opacity="0.3" />

                <rect x="47" y="22" width="16" height="8" rx="1" />
                <line x1="49" y1="26" x2="61" y2="26" opacity="0.3" />

                {/* Large Tome */}
                <rect x="72" y="10" width="12" height="28" rx="1.5" />
                <path d="M 75 10 V 38 M 81 10 V 38" opacity="0.3" />

                {/* Small Leaning Book */}
                <g transform="translate(94, 38) rotate(-14) translate(-94, -38)">
                  <rect x="88" y="20" width="7" height="18" rx="1" />
                </g>


              </g>
            </pattern>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={
                occasion ? "url(#pattern-triangles)" : "url(#pattern-books)"
              }
            />
          </svg>
        </div>
        <div className="w-full max-w-367.5 mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between py-4 relative z-10">
            {/* Logo */}
            <Link
              to="/"
              onClick={(e) => handleSafeNavigation(e, "/")}
              className={`touch-area relative flex items-center gap-3 text-2xl font-bold tracking-tight transition-colors duration-300`}
              onContextMenu={handleContextMenu}
            >
              {/* Occasion Logo Decor */}
              {occasion === "ramadan" && (
                <>
                  <span className="absolute -top-4.5 -left-3 w-8 h-8 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 125"
                      className="w-full h-full fill-current"
                    >
                      <g>
                        <path d="M29.015,40.857L40.36,88.04h20.53l10.985-47.183H29.015z M49.381,80.678h-8.377l-7.667-32.932h16.044V80.678z M59.722,80.678h-8.377V47.746H67.39L59.722,80.678z" />
                      </g>
                      <polygon points="93.57,27.739 93.57,27.864 93.256,27.676" />
                      <polygon points="38.379,19.607 62.511,19.607 75.657,39.417 29.015,39.417 25.773,39.417" />
                      <polygon points="69.714,93.63 31.536,93.63 40.353,89.481 60.897,89.481" />
                      <circle
                        cx="50.265"
                        cy="13.124"
                        r="6.483"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>

                  <span className="absolute -top-3.5 -right-3 text-xl animate-swing scale-x-[-1] origin-bottom drop-shadow-sm pointer-events-none">
                    <FaMoon className="text-indigo-600 dark:text-indigo-400" />
                  </span>
                </>
              )}
              {occasion === "eid_fitr" && (
                <>
                  <span className="absolute -top-3.5 -left-3 text-[1.4rem] rotate-12 drop-shadow-sm pointer-events-none">
                    🎉
                  </span>
                  <span className="absolute -top-3.5 -right-3 text-xl animate-swing scale-x-[-1] origin-bottom drop-shadow-sm pointer-events-none">
                    🎊
                  </span>
                </>
              )}
              {occasion === "eid_adha" && (
                <>
                  <span className="absolute -top-3.5 -left-3 text-[1.4rem] rotate-12 drop-shadow-sm pointer-events-none">
                    🎉
                  </span>
                  <span className="absolute -top-3.5 -right-3 text-xl animate-swing origin-bottom drop-shadow-sm pointer-events-none">
                    🐑
                  </span>
                </>
              )}
              <span className="relative">
                <span className="text-2xl text-indigo-50 dark:text-indigo-200 font-extrabold">
                  Bookfly
                </span>
                {/* Book icon above "y" */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 28 22"
                  className="absolute -top-2 -right-2 w-5 h-4 drop-shadow-sm pointer-events-none"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="bookfly-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        className="[stop-color:var(--color-indigo-50)] dark:[stop-color:var(--color-indigo-200)]"
                      />
                      <stop
                        offset="100%"
                        className="[stop-color:var(--color-indigo-50)] dark:[stop-color:var(--color-indigo-200)]"
                      />
                    </linearGradient>
                  </defs>
                  {/* Open book */}
                  <path
                    d="M 6 10 Q 10 6 14 10 V 18 Q 10 14 6 18 Z"
                    fill="url(#bookfly-grad)"
                    opacity="0.85"
                  />
                  <path
                    d="M 14 10 Q 18 6 22 10 V 18 Q 18 14 14 18 Z"
                    fill="url(#bookfly-grad)"
                    opacity="0.65"
                  />
                  <line
                    x1="14"
                    y1="10"
                    x2="14"
                    y2="18"
                    stroke="url(#bookfly-grad)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </Link>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8">
              <ul className="flex gap-2 md:gap-1 lg:gap-2 font-medium">
                {links.map(({ label, to, icon }) => (
                  <li
                    key={to}
                    className={`relative ${
                      label === "Community" ? "hidden lg:block" : ""
                    }`}
                  >
                    <NavLink
                      to={to}
                      onClick={(e) => handleSafeNavigation(e, to)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold"
                            : "text-indigo-100 dark:text-zinc-400 hover:bg-white/10 dark:hover:bg-zinc-800/80 hover:text-white dark:hover:text-indigo-300"
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
            <div className="hidden md:flex items-center gap-5 shrink-0">
              {/* Notifications */}
              {user && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => {
                      toggleNotifications();
                      // Mark all as read when opening notifications if there are unread ones
                      if (!openNotifications && unreadCount > 0) {
                        markAllAsRead();
                      }
                    }}
                    className={`relative p-2.5 rounded-full transition duration-300 cursor-pointer border border-white/10 dark:border-zinc-700/50 ${
                      openNotifications
                        ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold"
                        : "bg-white/5 dark:bg-zinc-800/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:text-indigo-300 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span
                        className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-red-500 shadow-sm border-2 border-white dark:border-zinc-900`}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {openNotifications && (
                    <div
                      ref={notificationsDropdownRef}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-100 max-h-96 overflow-hidden flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-700">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {t("Notifications")}
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                          >
                            {t("Mark all as read")}
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div
                        dir={i18n.dir()}
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#818cf8 transparent",
                        }}
                        className="overflow-y-auto flex-1"
                      >
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                            <div className="flex flex-col items-center gap-2">
                              <Bell
                                size={32}
                                className="text-zinc-400 dark:text-zinc-500"
                              />
                              <p className="text-sm">
                                {t("No notifications yet")}
                              </p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                {t(
                                  "You'll be notified when your orders are approved",
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="divide-y divide-zinc-300 dark:divide-zinc-700">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`group relative p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition ${
                                  !notification.read
                                    ? "bg-indigo-50 dark:bg-indigo-900/20"
                                    : ""
                                }`}
                              >
                                <div
                                  className="flex items-start justify-between gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    handleSafeNavigation(e, "/profile", () =>
                                      markAsRead(notification.id),
                                    );
                                  }}
                                >
                                  <div className="flex-1 pr-6">
                                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                      {notification.type === "author_status"
                                        ? i18n.language === "ar"
                                          ? `تم ${notification.status === "approved" ? "قبول" : "رفض"} طلب انضمامك كمؤلف.`
                                          : `Your author application has been ${notification.status === "approved" ? "approved" : "rejected"}.`
                                        : notification.type === "role_change"
                                          ? i18n.language === "ar"
                                            ? `مبروك! تم ترقية حسابك إلى مؤلف. يمكنك الآن البدء بنشر كتبك.`
                                            : `Congratulations! Your account has been promoted to Author. You can now start publishing your books.`
                                          : notification.type === "book_status"
                                            ? i18n.language === "ar"
                                              ? `تم ${notification.status === "approved" ? "الموافقة على" : "رفض"} كتابك "${notification.bookTitle}".`
                                              : `Your book "${notification.bookTitle}" has been ${notification.status === "approved" ? "approved" : "rejected"}.`
                                            : i18n.language === "ar"
                                              ? `تم شراء كتاب "${notification.bookTitle}" بنجاح! الآن يتوفر في مكتبتك على ملفك الشخصي.`
                                              : `Book "${notification.bookTitle}" was purchased successfully! It’s now available in your library on your profile.`}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                      {new Date(
                                        notification.timestamp,
                                      ).toLocaleString("en-US")}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                  title={t("Remove")}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              <NavLink
                to="/cart"
                onClick={(e) => handleSafeNavigation(e, "/cart")}
                className={({ isActive }) =>
                  `relative p-2.5 rounded-full transition duration-300 cursor-pointer border border-white/10 dark:border-zinc-700/50 ${
                    isActive
                      ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold"
                      : "bg-white/5 dark:bg-zinc-800/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:text-indigo-300 dark:hover:bg-zinc-800/80"
                  }`
                }
                onContextMenu={handleContextMenu}
              >
                <ShoppingCart
                  size={20}
                  className={`transition cursor-pointer`}
                />
                {getCartItemsCount() > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-indigo-600 text-white shadow-sm border-2 border-white dark:border-zinc-900`}
                  >
                    {getCartItemsCount()}
                  </span>
                )}
              </NavLink>
              {/* Settings preferance */}
              <div
                dir="auto"
                className="relative hidden md:flex"
                ref={settingsRef}
              >
                <button
                  onClick={toggleSettings}
                  className={`p-2.5 rounded-full transition duration-300 cursor-pointer border border-white/10 dark:border-zinc-700/50 ${
                    openSettings
                      ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold rotate-180"
                      : "bg-white/5 dark:bg-zinc-800/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:bg-zinc-800/80 dark:hover:text-indigo-300 rotate-0"
                  }`}
                >
                  <Settings size={20} />
                </button>

                {/* Dropdown */}
                {openSettings && (
                  <div className="absolute right-0 mt-13 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in duration-200">
                    {/* Dark Mode */}
                    <div
                      onClick={toggleTheme}
                      className="group flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition duration-300"
                    >
                      <div className="flex items-center gap-2">
                        {theme === "light" ? (
                          <Sun
                            className="text-zinc-800 dark:text-zinc-200 group-hover:rotate-360 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                            size={18}
                          />
                        ) : (
                          <Moon
                            className="text-zinc-800 dark:text-zinc-200 group-hover:scale-125 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                            size={18}
                          />
                        )}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition duration-300 whitespace-nowrap">
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
                            isDarkModeActive()
                              ? "translate-x-5"
                              : "translate-x-0"
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
                            className="text-zinc-800 dark:text-zinc-200 group-hover:scale-125 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition duration-300"
                            size={18}
                          />
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition duration-300 whitespace-nowrap">
                            {t("Language")}
                          </span>
                        </div>
                        <div
                          dir="ltr"
                          className="relative inline-flex items-center gap-0.5 -ms-3 min-w-15 justify-end"
                        >
                          <div className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold relative h-4 w-14 flex items-center justify-end">
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
                            className="text-zinc-800 dark:text-zinc-200 group-hover:translate-y-1 transition-all duration-500"
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
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition duration-300 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-600/20`}
                  onContextMenu={handleContextMenu}
                >
                  <User size={20} />
                  <span className="font-semibold">{t("Register")}</span>
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
                    className={`md:hidden lg:flex items-center gap-2 transition cursor-pointer text-indigo-100 dark:text-zinc-300 hover:text-white dark:hover:text-indigo-400 font-medium`}
                  >
                    {firstName}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${openDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {openDropdown && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-13 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in duration-200"
                    >
                      {/* admin Dashboard */}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={(e) => {
                            handleSafeNavigation(e, "/admin", closeDropdown);
                          }}
                          className="block px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 font-medium"
                          onContextMenu={handleContextMenu}
                        >
                          {t("Dashboard")}
                        </Link>
                      )}

                      {/* Author Dashboard */}
                      {user?.role === "author" && (
                        <Link
                          to="/author-dashboard"
                          onClick={(e) => {
                            handleSafeNavigation(
                              e,
                              "/author-dashboard",
                              closeDropdown,
                            );
                          }}
                          className="block px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 font-medium"
                          onContextMenu={handleContextMenu}
                        >
                          {t("Dashboard")}
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={(e) => {
                          handleSafeNavigation(e, "/profile", closeDropdown);
                        }}
                        className="block px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-indigo-200 dark:text-white"
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
              {/* Mobile Notifications */}
              {user && (
                <div className="relative" ref={mobileNotificationsRef}>
                  <button
                    onClick={() => {
                      toggleNotifications();
                      // Mark all as read when opening notifications if there are unread ones
                      if (!openNotifications && unreadCount > 0) {
                        markAllAsRead();
                      }
                    }}
                    className={`touch-area relative p-2.5 rounded-full transition duration-300 cursor-pointer border border-white/10 dark:border-zinc-700/50 active:scale-95 ${
                      openNotifications
                        ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold"
                        : "bg-white/5 dark:bg-zinc-800/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:text-indigo-300 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span
                        className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-red-500 shadow-sm border-2 border-white dark:border-zinc-900`}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Notifications Dropdown */}
                  {openNotifications && (
                    <div
                      ref={mobileNotificationsDropdownRef}
                      className="fixed top-16 right-4 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-100 max-h-96 overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {t("Notifications")}
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="touch-area text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            {t("Mark all as read")}
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div
                        dir={i18n.dir()}
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#818cf8 transparent",
                        }}
                        className="overflow-y-auto flex-1"
                      >
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                            <div className="flex flex-col items-center gap-2">
                              <Bell
                                size={32}
                                className="text-zinc-400 dark:text-zinc-500"
                              />
                              <p className="text-sm">
                                {t("No notifications yet")}
                              </p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                {t(
                                  "You'll be notified when your orders are approved",
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="divide-y divide-zinc-300 dark:divide-zinc-700">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`touch-area p-4 active:bg-zinc-300 dark:active:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer ${
                                  !notification.read
                                    ? "bg-indigo-50 dark:bg-indigo-900/20"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  handleSafeNavigation(e, "/profile", () => {
                                    markAsRead(notification.id);
                                    closeNotifications();
                                    closeMenu();
                                  });
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                      {notification.type === "author_status"
                                        ? i18n.language === "ar"
                                          ? `تم ${notification.status === "approved" ? "قبول" : "رفض"} طلب انضمامك كمؤلف.`
                                          : `Your author application has been ${notification.status === "approved" ? "approved" : "rejected"}.`
                                        : notification.type === "role_change"
                                          ? i18n.language === "ar"
                                            ? `مبروك! تم ترقية حسابك إلى مؤلف. يمكنك الآن البدء بنشر كتبك.`
                                            : `Congratulations! Your account has been promoted to Author. You can now start publishing your books.`
                                          : i18n.language === "ar"
                                            ? `تم شراء كتاب "${notification.bookTitle}" بنجاح! الآن يتوفر في مكتبتك على ملفك الشخصي.`
                                            : `Book "${notification.bookTitle}" was purchased successfully! It’s now available in your library on your profile.`}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                      {new Date(
                                        notification.timestamp,
                                      ).toLocaleString("en-US")}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="touch-area text-zinc-400 hover:text-red-500 transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Cart */}
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `relative touch-area p-2.5 rounded-full transition duration-300 cursor-pointer border border-white/10 dark:border-zinc-700/50 ${
                    isActive
                      ? "bg-white/15 dark:bg-indigo-500/10 text-white dark:text-indigo-400 font-semibold"
                      : "bg-white/5 dark:bg-zinc-800/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:text-indigo-300 dark:hover:bg-zinc-800/80"
                  }`
                }
                onClick={closeMenu}
                onContextMenu={handleContextMenu}
              >
                <ShoppingCart size={22} className="transition cursor-pointer" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm border-2 border-white dark:border-zinc-900">
                    {getCartItemsCount()}
                  </span>
                )}
              </NavLink>

              {/* Menu Toggle */}
              <button
                ref={menuRef}
                onClick={toggleMenu}
                className={`touch-area p-2.5 rounded-full transition duration-300 cursor-pointer bg-white/5 dark:bg-zinc-800/50 border border-white/10 dark:border-zinc-700/50 text-indigo-100 dark:text-zinc-400 hover:bg-white/15 hover:text-white dark:hover:text-indigo-300 dark:hover:bg-zinc-800/80 active:scale-95`}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        <div
          className={`absolute bottom-0 h-0.5 transition-all duration-300 overflow-hidden ${
            isLoading ? "w-[95%] lg:w-[99%] opacity-100" : "w-0 opacity-0"
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
              className={"animate-wave"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                backgroundSize: "50% 100%",
              }}
            />
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay — outside <header> so CSS transform on header doesn't affect fixed children */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[45]"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar — outside <header> for the same reason */}
      <div
        ref={sidebarRef}
        className={`md:hidden fixed top-0 left-0 w-3/4 max-w-xs bg-white dark:bg-zinc-900 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 z-[46] overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link
            to="/"
            onClick={(e) => handleSafeNavigation(e, "/", closeMenu)}
            className="touch-area flex items-center gap-3 text-indigo-600 dark:text-indigo-400 text-xl font-bold tracking-tight mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800"
            onContextMenu={handleContextMenu}
          >
            <span>Bookfly</span>
          </Link>

          <ul className="flex flex-col gap-4 text-zinc-800 dark:text-zinc-200 font-medium">
            {links.map(({ label, to, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={(e) => handleSafeNavigation(e, to, closeMenu)}
                  className={({ isActive }) =>
                    `touch-area flex items-center gap-3 py-2 px-4 rounded-xl transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/20"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`
                  }
                  onContextMenu={handleContextMenu}
                >
                  {icon && getIcon(icon, 18)}
                  <span>{t(label)}</span>
                </NavLink>
              </li>
            ))}
            {/* Cart */}
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
                <div className="flex items-center gap-3">
                  <Moon size={18} />
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {t("Dark Mode")}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
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
            {/* Profile / Register */}
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
                    className="touch-area items-center gap-3 py-2 px-4 rounded-lg transition-colors hover:text-indigo-600 dark:text-indigo-100  dark:hover:text-indigo-100 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    onContextMenu={handleContextMenu}
                  >
                    <UserAvatar user={user} size={32} className="shadow-md" />
                    {firstName}
                  </Link>
                  {user?.role === "author" && (
                    <Link
                      to="/author-dashboard"
                      onClick={(e) =>
                        handleSafeNavigation(e, "/author-dashboard", closeMenu)
                      }
                      className="touch-area flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 font-medium"
                      onContextMenu={handleContextMenu}
                    >
                      {t("Author Dashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="touch-area w-full flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-left"
                  >
                    {t("Logout")}
                  </button>
                </>
              )}
            </li>
            {/* Language */}
            <li ref={mobileLanguageRef}>
              <div
                onClick={toggleLanguageDropdown}
                className="touch-area flex items-center justify-between py-2 px-4 cursor-pointer rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <Languages
                    className="text-zinc-800 dark:text-zinc-200"
                    size={18}
                  />
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {t("Language")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-300">
                    {i18n.language === "ar" ? "عربي" : "English"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-800 dark:text-zinc-200 transition-transform duration-200 ${
                      openLanguageDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
              {openLanguageDropdown && (
                <div className="mx-2 mt-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                  <div
                    onClick={() => {
                      i18n.changeLanguage("en");
                      localStorage.setItem("language", "en");
                      closeLanguageDropdown();
                    }}
                    className={`touch-area flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      i18n.language === "en"
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      English
                    </span>
                    {i18n.language === "en" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <div
                    onClick={() => {
                      i18n.changeLanguage("ar");
                      localStorage.setItem("language", "ar");
                      closeLanguageDropdown();
                    }}
                    className={`touch-area flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      i18n.language === "ar"
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      عربي
                    </span>
                    {i18n.language === "ar" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
export default Header;
