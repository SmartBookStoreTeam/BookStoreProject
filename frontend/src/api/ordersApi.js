import api from "./api";

// Create a new order
export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

// Get user orders (history)
export const getMyOrders = async () => {
  const res = await api.get("/orders/my-orders");
  return res.data;
};

// Get user's library (purchased books)
export const getMyLibrary = async () => {
  const res = await api.get("/orders/my-library");
  return res.data;
};

// Update reading progress
export const updateReadingProgress = async (bookId, lastReadPage) => {
  const res = await api.put(`/orders/my-library/${bookId}/progress`, { lastReadPage });
  return res.data;
};
