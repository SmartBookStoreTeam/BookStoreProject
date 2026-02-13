import api from "./api";

/**
 * Create Stripe checkout session
 * @param {Array} items - Array of { bookId, quantity }
 * @returns {Promise} - { success: true, data: { orderId, url } }
 */
export const createCheckoutSession = async (items) => {
  const res = await api.post("/payments/checkout", { items });
  return res.data;
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 * @returns {Promise} - { success: true }
 */
export const cancelOrder = async (orderId) => {
  const res = await api.post(`/payments/cancel/${orderId}`);
  return res.data;
};
