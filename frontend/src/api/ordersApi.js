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
