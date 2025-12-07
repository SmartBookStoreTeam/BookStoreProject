import { navLinks } from "../assets/assets";
import { ShoppingCart, Menu, X, User } from "lucide-react"; // User icon for register
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const Header = () => {
  const links = navLinks;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { theme, setTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-200 dark:bg-zinc-900 shadow-sm dark:shadow-zinc-800 z-50 border-b border-zinc-300 dark:border-zinc-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-indigo-950 dark:text-indigo-200 text-2xl font-bold tracking-tight"
          >
            Books
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-6 text-indigo-950 dark:text-zinc-200 font-medium">
              {links.map(({ label, to }) => (
                <li key={to} className="relative">
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `relative pb-1 after:absolute after:left-0 after:bottom-0 
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
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6">
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

            {/* Register */}
            <Link
              to="/register"
              className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
            >
              <User size={24} />
              Register
            </Link>

            {/* Theme Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-zinc-300 dark:bg-zinc-700 text-indigo-900 dark:text-indigo-200 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
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
          <ul className="flex flex-col gap-4 text-indigo-950 dark:text-zinc-200 font-medium">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-lg transition-colors ${
                      isActive
                        ? "text-indigo-500 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Mobile Cart */}
            <li>
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <ShoppingCart size={18} />
                Cart {getCartItemsCount() > 0 && `(${getCartItemsCount()})`}
              </Link>
            </li>

            {/* Register */}
            <li>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                <User size={18} />
                Register
              </Link>
            </li>

            {/* Dark Mode */}
            <li>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
