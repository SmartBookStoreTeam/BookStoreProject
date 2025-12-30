import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Shop from "./pages/Shop";
import Publish from "./pages/Publish";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import UserBooks from "./pages/UserBooks";
import BookDetailsPage from "./pages/BookDetails";
import AdminBookDetails from "./pages/admin/AdminBookDetails";
import { useScrollToTop } from "./hooks/useScrollTop";
import Profile from "./pages/Profile";
import AuthorProfile from "./pages/AuthorProfile";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import { AuthProvider } from "./context/AuthContext";
import { NavigationProvider } from "./context/NavigationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import PdfViewer from "./pages/PdfViewer";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "react-i18next";

function App() {
  useScrollToTop();
  useTheme();
  const { i18n } = useTranslation();

  // Update HTML lang attribute based on current language
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="shop" element={<Shop />} />
              <Route path="book/:id" element={<BookDetailsPage />} />
              <Route path="publish" element={<Publish />} />
              <Route path="cart" element={<Cart />} />
              <Route path="user-books" element={<UserBooks />} />
              <Route path="author/:name" element={<AuthorProfile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* PDF Viewer - Full Screen (Outside Layout) */}
            <Route
              path="book/pdf/:bookId"
              element={
                <UserProtectedRoute>
                  <PdfViewer />
                </UserProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/user-login" element={<UserLogin />} />

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="/admin/books/:id" element={<AdminBookDetails />} />
            </Route>
          </Routes>
        </NavigationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
