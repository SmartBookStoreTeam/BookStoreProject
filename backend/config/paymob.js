import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const PAYMOB_BASE_URL = "https://accept.paymob.com/api";
export const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
export const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
export const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
export const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

/**
 * Step 1 — Authenticate with Paymob and get auth token
 * Token expires after 1 hour
 */
export const getAuthToken = async () => {
  const response = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
    api_key: PAYMOB_API_KEY,
  });
  return response.data.token;
};

/**
 * Step 2 — Register an order with Paymob
 */
export const registerPaymobOrder = async (
  authToken,
  { amountCents, items },
) => {
  const response = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amountCents,
    currency: "EGP",
    items, // [{ name, amount_cents, description, quantity }]
  });
  return response.data;
};

/**
 * Step 3 — Get a payment key (token for the iframe)
 */
export const getPaymentKey = async (
  authToken,
  { amountCents, paymobOrderId, billingData },
) => {
  const response = await axios.post(
    `${PAYMOB_BASE_URL}/acceptance/payment_keys`,
    {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: Number(PAYMOB_INTEGRATION_ID),
    },
  );
  return response.data.token;
};
