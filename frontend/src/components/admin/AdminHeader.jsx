// components/admin/AdminHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  HomeIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
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
    <header className="bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cursor-pointer p-2 m-2 rounded-md text-gray-600 dark:text-gray-400 bg-zinc-800/20 hover:text-white dark:hover:text-gray-300 hover:bg-zinc-800/40 dark:hover:bg-gray-800 focus:outline-none"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Right side */}
        <div className="hidden flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-400">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Administrator</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className=" cursor-pointer h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="h-5 w-5" />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 z-10 ${
                  dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setDropdownOpen(false);
                    }}
                    className=" cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate("/");
                      setDropdownOpen(false);
                    }}
                    className=" cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    View Store
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className=" cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-800/20 flex items-center"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
