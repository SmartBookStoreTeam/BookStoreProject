import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Shop from "./pages/Shop";
import Publish from "./pages/Publish";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import PaymentCancel from "./pages/PaymentCancel";
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
import AddBook from "./pages/admin/AddBook";
import EditBook from "./pages/admin/EditBook";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminPendingBooks from "./pages/admin/AdminPendingBooks";
import AuthorDashboard from "./pages/AuthorDashboard";
import { AuthProvider } from "./context/AuthContext";
import { NavigationProvider } from "./context/NavigationContext";
import { LoadingProvider } from "./context/LoadingContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GuestRoute from "./components/GuestRoute";
import PdfViewer from "./pages/PdfViewer";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "react-i18next";
import VerifyEmail from "./pages/VerifyEmail";
import AboutUs from "./pages/AboutUs";
import OccasionModal from "./components/OccasionModal";
import AddAuthorBook from "./pages/author/AddAuthorBook";
import EditAuthorBook from "./pages/author/EditAuthorBook";
import AuthorLayout from "./pages/author/AuthorLayout";
import AuthorSubmissions from "./pages/author/AuthorSubmissions";

function App() {
  useScrollToTop();
  useTheme();
  const { t, i18n } = useTranslation();

  // Update HTML lang attribute based on current language
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t("Bookfly Store - Buy your favorite books online");
  }, [i18n.language, t]);

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationProvider>
          <LoadingProvider>
            <NotificationProvider>
              <Toaster position="top-center" />
              <OccasionModal />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="book/:id" element={<BookDetailsPage />} />
                  <Route path="publish" element={<Publish />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route
                    path="checkout/success"
                    element={<CheckoutSuccess />}
                  />
                  <Route path="checkout-success" element={<CheckoutSuccess />} />
                  <Route path="payment/success" element={<CheckoutSuccess />} />
                  <Route path="payment/cancel" element={<PaymentCancel />} />
                  <Route path="user-books" element={<UserBooks />} />
                  <Route path="author/:name" element={<AuthorProfile />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="community" element={<AboutUs />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* PDF Viewer - Full Screen (Outside Layout) */}
                <Route
                  path="pdf-viewer/:bookId"
                  element={<PdfViewer />}
                />

                {/* Auth Routes */}
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <GuestRoute>
                      <VerifyEmail />
                    </GuestRoute>
                  }
                />

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
                  <Route path="books/pending" element={<AdminPendingBooks />} />
                  <Route path="books/add" element={<AddBook />} />
                  <Route path="books/edit/:id" element={<EditBook />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers&authors" element={<AdminCustomers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="books/:id" element={<AdminBookDetails />} />
                </Route>

                {/* Author Dashboard - Full Screen with Sidebar (Outside Layout) */}
                <Route
                  path="/author-dashboard"
                  element={
                    <ProtectedRoute roles={["author", "admin"]}>
                      <AuthorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AuthorDashboard />} />
                  <Route path="submissions" element={<AuthorSubmissions />} />
                  <Route path="add-book" element={<AddAuthorBook />} />
                  <Route path="edit-book/:id" element={<EditAuthorBook />} />
                </Route>
              </Routes>
            </NotificationProvider>
          </LoadingProvider>
        </NavigationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
