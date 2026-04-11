import api from "./api";

export const applyCoupon = async (code) => {
  const res = await api.post("/coupons/apply", {
    code: String(code || "").toUpperCase().trim(),
  });
  return res.data; // { success: true, data: { code, discountPercent } }
};

// ── Admin coupon functions ──────────────────────────────────
export const getAllCoupons = async () => {
  const res = await api.get("/admin/coupons");
  return res.data;
};

export const createCoupon = async (data) => {
  const res = await api.post("/admin/coupons", data);
  return res.data;
};

export const generateCoupon = async (data) => {
  const res = await api.post("/admin/coupons/generate", data);
  return res.data;
};

export const deleteCoupon = async (id) => {
  const res = await api.delete(`/admin/coupons/${id}`);
  return res.data;
};

export const toggleCoupon = async (id) => {
  const res = await api.patch(`/admin/coupons/${id}/toggle`);
  return res.data;
};
