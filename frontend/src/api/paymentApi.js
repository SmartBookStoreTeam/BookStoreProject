import api from "./api";

/**
 * Create Paymob checkout session
 * @param {Array} items - Array of { bookId, quantity }
 * @param {string} couponCode - Optional coupon code
 * @returns {Promise} - { success: true, data: { orderId, iframeUrl } }
 */
export const createCheckoutSession = async (items, couponCode) => {
  const payload = { items };
  if (couponCode) payload.couponCode = couponCode;
  const res = await api.post("/payments/checkout", payload);
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
