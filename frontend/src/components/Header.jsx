import { navLinks } from "../assets/assets";
import { ShoppingCart, Menu, X, User } from "lucide-react"; // User icon for register
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../hooks/useCart";

const Header = () => {
  const links = navLinks;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-200 shadow-sm z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-4">
          {/* Logo / Title */}
          <Link
            to="/"
            className="text-indigo-950 text-2xl font-bold tracking-tight"
          >
            Books
            {/* <img src={assets.logo} alt="" className=""/> */}
          </Link>

          {/* Center Navigation - Desktop only */}
          <nav className="hidden md:flex items-center gap-8 ">
            <ul className="flex gap-6 text-indigo-950 font-medium">
              {links.map(({ label, to }) => (
                <li key={to} className="relative">
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `relative pb-1 after:absolute after:left-0 after:bottom-0 
                      after:h-[2px] after:w-full after:bg-indigo-500 after:transition-transform 
                      after:duration-300 after:scale-x-0 hover:after:scale-x-100
                      after:origin-right hover:after:origin-left
                      ${isActive ? "text-indigo-500 font-semibold after:scale-x-100" : ""}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side - Cart + Register (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart
                size={24}
                className="text-indigo-950 hover:text-indigo-500 transition cursor-pointer"
              />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Register */}
            <Link
              to="/register"
              className="flex items-center gap-2 text-indigo-950 hover:text-indigo-500 transition"
            >
              <User size={24} />
              Register
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger/X) + Mobile Cart Icon */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Cart Icon */}
            <Link to="/cart" className="relative" onClick={closeMenu}>
              <ShoppingCart
                size={24}
                className="text-indigo-950 hover:text-indigo-500 transition cursor-pointer"
              />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={toggleMenu}
              className="text-indigo-950 hover:text-indigo-500 transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Sliding Sidebar) */}
        <div
          className={`md:hidden fixed top-0 left-0 w-3/4 max-w-xs bg-zinc-200 h-full p-6 transform transition-transform duration-300 z-40 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ul className="flex flex-col gap-4 text-indigo-950 font-medium">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-lg transition-colors ${
                      isActive ? "text-indigo-500 font-semibold bg-indigo-50" : "hover:bg-zinc-300"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Mobile Cart Link (inside sidebar for redundancy/clarity) */}
            <li>
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300"
              >
                <ShoppingCart size={18} />
                Cart {getCartItemsCount() > 0 && `(${getCartItemsCount()})`}
              </Link>
            </li>

            {/* Mobile Register Link */}
            <li>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors hover:bg-zinc-300"
              >
                <User size={18} />
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;