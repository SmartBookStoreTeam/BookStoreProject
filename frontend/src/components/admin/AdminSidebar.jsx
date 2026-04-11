import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPendingBooks } from "../../api/adminApi";
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
} from "@heroicons/react/24/outline";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

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
    { name: "Customers & Authors", path: "/admin/customers", icon: UsersIcon },
    { name: "Coupons", path: "/admin/coupons", icon: TagIcon },
    { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
    { name: "Settings", path: "/admin/settings", icon: CogIcon },
  ];

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-linear-to-b from-gray-900 to-indigo-800 text-white transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-full"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <ShoppingBagIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">Bookfly Admin</h1>
                <p className="text-xs text-gray-400">Dashboard v1.0</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-gray-700"
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
                end={item.path === "/admin"}
                onClick={item.onClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.isPending
                      ? "text-amber-300 hover:bg-amber-600/20"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Return to Store */}
          <div className="group p-4 border-t border-gray-700">
            <NavLink
              to="/"
              className="touch-area flex items-center space-x-3 px-4 py-3 rounded-full text-gray-300 hover:bg-indigo-600/20 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-2 transition-transform" />
              <span>Return to Store</span>
            </NavLink>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="font-semibold">
                  {user?.name?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-400">
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
