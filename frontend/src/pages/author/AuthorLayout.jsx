import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AuthorSidebar from "../../components/author/AuthorSidebar";
import AuthorHeader from "../../components/author/AuthorHeader";

const AuthorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
<div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <AuthorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
  className={`flex-1 flex flex-col min-w-0 ${
    sidebarOpen ? "md:ml-64" : ""
  } transition-all duration-300`}
>
        <AuthorHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

<main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthorLayout;
