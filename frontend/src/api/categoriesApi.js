import api from "./api";

// Get active categories (public)
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data.data;
};
