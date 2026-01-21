import api from "./api";

// Get all active categories (public)
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data; // Expected { success: true, data: [...] }
};

// Get all categories (admin)
export const getAdminCategories = async (params = {}) => {
  const res = await api.get("/categories/admin", { params });
  return res.data;
};
