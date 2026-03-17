import crypto from "crypto";

export const verifyHmac = (data, hmac) => {
  const secret = process.env.PAYMOB_HMAC_SECRET;

  const calculated = crypto
    .createHmac("sha512", secret)
    .update(data)
    .digest("hex");

  return calculated === hmac;
};
