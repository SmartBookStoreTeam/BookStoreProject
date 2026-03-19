import api from "./api";

export const applyCoupon = async (code) => {
  const res = await api.post("/coupons/apply", {
    code: String(code || "").toUpperCase().trim(),
  });
  return res.data; // { success: true, data: { code, discountPercent } }
};

