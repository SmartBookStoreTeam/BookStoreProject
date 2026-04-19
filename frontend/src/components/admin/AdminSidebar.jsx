import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPendingBooks } from "../../api/adminApi";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useNavigation } from "../../context/NavigationContext";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const { t } = useTranslation();
  const { requestNavigation } = useNavigation();

  const handleNavClick = (e, path) => {
    if (!requestNavigation(path)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getPendingBooks();
        setPendingCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch { /* silent */ }
    };
    fetchPending();
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: HomeIcon },
    { name: "Books", path: "/admin/books", icon: BookOpenIcon },
    {
      name: "Pending Books",
      path: "/admin/books/pending",
      icon: ClockIcon,
      badge: pendingCount,
      isPending: true,
    },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCartIcon },
    { name: "Customers & Authors", path: "/admin/customers&authors", icon: UsersIcon },
    { name: "Coupons", path: "/admin/coupons", icon: TagIcon },
    { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
  ];
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white  transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-full"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-[19px] border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <ShoppingBagIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold dark:text-white">{t("Bookfly Admin")}</h1>
                <p className="text-xs text-gray-400 dark:text-gray-200">{t("Dashboard")} v1.0</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="cursor-pointer md:hidden p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/admin" || item.name === "Books"}
                onClick={(e) => handleNavClick(e, item.path)}
                className={({ isActive }) =>
                  `flex text-gray-800 dark:text-gray-200 items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.isPending && !isActive
                      ? "text-amber-300 dark:text-amber-300 hover:bg-amber-600/20 dark:hover:bg-amber-600/20 rounded-xl"
                      : isActive 
                      ? "bg-blue-600 dark:bg-blue-600 text-white dark:text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-200 rounded-xl"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.name)}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 dark:bg-amber-500 text-gray-200 text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto border-t border-gray-200 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-950/50">
            {/* Return to Store */}
            <div className="px-4 py-2">
              <NavLink
                to="/"
                onClick={(e) => handleNavClick(e, "/")}
                className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t("Return to Store")}</span>
              </NavLink>
            </div>

            {/* User Profile */}
            <div className="p-4 relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  dropdownOpen 
                    ? "bg-white dark:bg-gray-700 shadow-lg ring-1 ring-gray-200 dark:ring-gray-600" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {/* Initial Avatar with Gradient */}
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <span className="font-bold text-sm">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "AD"}
                  </span>
                </div>
                
                <div className="ml-3 flex-1 text-left overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize font-medium">
                    {user?.role || "Administrator"}
                  </p>
                </div>
                
                <ChevronUpDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Upward Dropdown */}
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
                    <UserIcon className="h-4 w-4 text-gray-400" />
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

export default AdminSidebar;
