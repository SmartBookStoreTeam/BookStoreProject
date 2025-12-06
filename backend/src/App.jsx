import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Shop from "./pages/Shop";
import Sell from "./pages/Sell";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import UserBooks from "./pages/UserBooks";
import { useScrollToTop } from "./hooks/useScrollTop";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

function App() {
  useScrollToTop();
  return (
    <CartProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="shop" element={<Shop />} />
          <Route path="sell" element={<Sell />} />
          <Route path="cart" element={<Cart />} />
          <Route path="user-books" element={<UserBooks />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
