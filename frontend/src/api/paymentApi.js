import api from "./api";

/**
 * Create Paymob checkout session
 * @param {Array} items - Array of { bookId, quantity }
 * @param {string|null} couponCode - Optional coupon code
 * @param {boolean} isFirstOrder - Whether this is the user's first order (triggers 50% discount on first book)
 * @returns {Promise} - { success: true, data: { orderId, iframeUrl } }
 */
export const createCheckoutSession = async (items, couponCode, isFirstOrder = false) => {
  const payload = { items };
  if (couponCode) payload.couponCode = couponCode;
  if (isFirstOrder) payload.isFirstOrder = true;
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
