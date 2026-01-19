import api from "./api";

// Get all admin books
export const getAdminBooks = async (params = {}) => {
  const res = await api.get("/admin/books", { params });
  return res.data;
};

// Add a book
export const addBook = async (bookData) => {
  const res = await api.post("/admin/books", bookData);
  return res.data;
};

// Edit a book
export const updateBook = async (id, bookData) => {
  const res = await api.put(`/admin/books/${id}`, bookData);
  return res.data;
};

// Delete a book
export const deleteBook = async (id) => {
  const res = await api.delete(`/admin/books/${id}`);
  return res.data;
};

// Get all users
export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

// Get all orders
export const getOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data;
};

// Approve order
export const approveOrder = async (id) => {
  const res = await api.patch(`/admin/orders/${id}/approve`);
  return res.data;
};

// Reject order
export const rejectOrder = async (id) => {
  const res = await api.patch(`/admin/orders/${id}/reject`);
  return res.data;
};
