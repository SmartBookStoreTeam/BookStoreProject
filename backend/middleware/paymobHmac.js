import crypto from "crypto";
import { PAYMOB_HMAC_SECRET } from "../config/paymob.js";

export const verifyPaymobHmac = (req, res, next) => {
  try {
    const q = req.query;

    // Paymob sends these fields as query params for HMAC calculation
    // in this exact order
    const hmacFields = [
      q.amount_cents,
      q.created_at,
      q.currency,
      q.error_occured,
      q.has_parent_transaction,
      q.id,
      q.integration_id,
      q.is_3d_secure,
      q.is_auth,
      q.is_capture,
      q.is_refunded,
      q.is_standalone_payment,
      q.is_voided,
      q.order,
      q.owner,
      q.pending,
      q["source_data.pan"],
      q["source_data.sub_type"],
      q["source_data.type"],
      q.success,
    ];

    const concatenated = hmacFields.join("");

    const computedHmac = crypto
      .createHmac("sha512", PAYMOB_HMAC_SECRET)
      .update(concatenated)
      .digest("hex");

    const receivedHmac = q.hmac;

    if (computedHmac !== receivedHmac) {
      console.error("❌ HMAC mismatch — possible fake webhook");
      return res.status(401).json({ message: "Invalid HMAC signature" });
    }

    next();
  } catch (err) {
    console.error("❌ HMAC verification error:", err.message);
    return res.status(400).json({ message: "Webhook verification failed" });
  }
};
