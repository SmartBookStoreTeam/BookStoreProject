import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed header */}
      <Header />

      {/* Main content below */}
      <main className="flex-1 pt-16 overflow-x-hidden">
        {" "}
        {/* Added pt-16 for header spacing */}
        <Outlet />
      </main>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
