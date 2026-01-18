import api from "./api";

// Add a book
export const addBook = async (bookData) => {
  const res = await api.post("/admin/books", bookData);
  return res.data.data;
};

// Edit a book
export const updateBook = async (id, bookData) => {
  const res = await api.put(`/admin/books/${id}`, bookData);
  return res.data.data;
};

// Delete a book
export const deleteBook = async (id) => {
  const res = await api.delete(`/admin/books/${id}`);
  return res.data;
};

// Get all users
export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data.data;
};

// Get all orders
export const getOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data.data;
};
