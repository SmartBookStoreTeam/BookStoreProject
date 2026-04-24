import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyAuthorBooks } from "../../api/adminApi";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  BookOpenIcon,
  PlusCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigation } from "../../context/NavigationContext";
import UserAvatar from "../UserAvatar";

const AuthorSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const { t } = useTranslation();
  const { requestNavigation } = useNavigation();

  const handleNavClick = (e, path, originalOnClick) => {
    if (!requestNavigation(path)) {
      e.preventDefault();
      return;
    }
    if (originalOnClick) originalOnClick();
  };

  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getMyAuthorBooks();
        const books = Array.isArray(res.data) ? res.data : [];
        setPendingCount(
          books.filter((b) => b.approvalStatus === "pending").length,
        );
      } catch {
        /* silent */
      }
    };
    fetchPending();
  }, []);

  const navItems = [
    {
      name: "Overview",
      path: "/author-dashboard",
      icon: HomeIcon,
      exact: true,
    },
    {
      name: "Books' status",
      path: "/author-dashboard/submissions",
      icon: BookOpenIcon,
      isSubmissions: true,
      badge: pendingCount,
      onClick: () => localStorage.setItem("authorDashTab", "mybooks"),
    },
    {
      name: "Publish New Book",
      path: "/author-dashboard/add-book",
      icon: PlusCircleIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 dark:bg-zinc-900 border-r border-indigo-700 dark:border-indigo-700/20 text-white transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-full"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-indigo-700 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <PencilIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-bold">{t("Author Studio")}</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-indigo-700 dark:hover:bg-zinc-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#818cf8 transparent",
            }}
            className="flex-1 p-4 space-y-1 overflow-y-auto"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={(e) => handleNavClick(e, item.path, item.onClick)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg transition-colors dark:text-gray-200 ${
                    item.isSubmissions && !isActive
                      ? "text-amber-300 hover:text-amber-600  hover:bg-amber-600/20"
                      : isActive
                      ? "bg-indigo-600 text-white dark:bg-indigo-700"
                      : "hover:bg-indigo-700/50 text-indigo-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.name)}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto border-t border-indigo-700 dark:border-zinc-900 bg-indigo-950/20 dark:bg-zinc-950/20">
            {/* Back to Profile / Store Navigation */}
            <div className="px-4 py-2">
              <NavLink
                to="/profile"
                onClick={(e) => handleNavClick(e, "/profile")}
                className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-100 dark:text-gray-300 hover:bg-indigo-700/50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform text-indigo-300" />
                <span className="text-sm font-medium">{t("Back to Profile")}</span>
              </NavLink>
            </div>

            {/* User Profile Card */}
            <div className="p-4 relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  dropdownOpen 
                    ? "bg-indigo-800 dark:bg-gray-700 shadow-lg ring-1 ring-indigo-700 dark:ring-gray-600" 
                    : "hover:bg-indigo-800/50 dark:hover:bg-gray-700"
                }`}
              >
                <UserAvatar user={user} size={40} className="shadow-md shrink-0" />
                
                <div className="ml-3 flex-1 text-left overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.name || t("Author")}
                  </p>
                  <p className="text-xs text-indigo-300 dark:text-gray-400 truncate font-medium">
                    {user?.email}
                  </p>
                </div>
                
                <ChevronUpDownIcon className={`h-5 w-5 text-indigo-300 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Upward Dropdown Menu */}
              <div
                className={`absolute bottom-full left-4 right-4 mb-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform origin-bottom ${
                  dropdownOpen 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                } z-50`}
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      if (requestNavigation("/profile")) {
                        navigate("/profile");
                        setDropdownOpen(false);
                      }
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <UserCircleIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{t("Profile")}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (requestNavigation("/")) {
                        navigate("/");
                        setDropdownOpen(false);
                      }
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{t("View Store")}</span>
                  </button>
                  
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                    <span className="font-bold">{t("Logout")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AuthorSidebar;
