import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// import logo from "../../assets/logo.png";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: HomeIcon },
    { name: "Books", path: "/admin/books", icon: BookOpenIcon },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCartIcon },
    { name: "Customers", path: "/admin/customers", icon: UsersIcon },
    { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
    { name: "Settings", path: "/admin/settings", icon: CogIcon },
  ];

  const { user } = useAuth();

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <ShoppingBagIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">BookStore Admin</h1>
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
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Return to Store */}
          <div className="p-4 border-t border-gray-700">
            <NavLink
              to="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
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
