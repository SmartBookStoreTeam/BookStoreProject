import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";

const AuthorSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const { t } = useTranslation();

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-full"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-indigo-700">
            <div className="flex items-center space-x-3">
              <PencilIcon className="h-8 w-8 text-indigo-300" />
              <div>
                <h1 className="text-xl font-bold">{t("Author Studio")}</h1>
                <p className="text-xs text-indigo-300">
                  {user?.name || t("Author")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-indigo-700"
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
                end={item.exact}
                onClick={item.onClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.isSubmissions
                      ? "text-amber-300 hover:bg-indigo-700/50"
                      : isActive
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-indigo-700/50 text-indigo-200"
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

          {/* Return to Profile */}
          <div className="group p-4 border-t border-indigo-700">
            <NavLink
              to="/profile"
              className="flex items-center space-x-3 px-4 py-3 rounded-full text-indigo-200 hover:bg-indigo-600/30 transition-colors"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>{t("Back to Profile")}</span>
            </NavLink>
          </div>

          {/* User Card */}
          <div className="p-4 border-t border-indigo-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{user?.name || t("Author")}</p>
                <p className="text-xs text-indigo-300 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AuthorSidebar;
