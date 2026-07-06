import api from "./api";

/**
 * Create Stripe Checkout Session
 * @param {Array} items - Array of { bookId, quantity }
 * @param {string|null} couponCode - Optional coupon code
 * @param {boolean} isFirstOrder - Whether this is the user's first order (triggers 50% discount on first book)
 * @returns {Promise} - { success: true, data: { orderId, checkoutUrl } }
 */
export const createCheckoutSession = async (items, couponCode, isFirstOrder = false) => {
  const payload = { items };
  if (couponCode) payload.couponCode = couponCode;
  if (isFirstOrder) payload.isFirstOrder = true;
  const res = await api.post("/payments/checkout", payload);
  return res.data;
};

/**
 * Verify Stripe session after redirect from Stripe
 * @param {string} sessionId - Stripe session_id from URL query param
 * @returns {Promise} - { success: true, order: {...} }
 */
export const verifySession = async (sessionId) => {
  const res = await api.get(`/payments/verify?session_id=${sessionId}`);
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
