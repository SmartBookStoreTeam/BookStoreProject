import api from "./api";

// Get cart
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

// Add item to cart
export const addToCart = async (bookId) => {
  const res = await api.post("/cart", { bookId });
  return res.data;
};

// Remove item from cart
export const removeFromCart = async (bookId) => {
  const res = await api.delete(`/cart/${bookId}`);
  return res.data;
};

// Update cart item quantity
export const updateCartItem = async (bookId, quantity) => {
  const res = await api.put(`/cart/${bookId}`, { quantity });
  return res.data;
};

// Clear cart
export const clearCart = async () => {
  const res = await api.delete("/cart");
  return res.data;
};

// Sync cart from localStorage
export const syncCart = async (items) => {
  const res = await api.post("/cart/sync", { items });
  return res.data;
};
