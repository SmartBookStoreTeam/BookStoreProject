import api from "./api";

// Get all admin books
export const getAdminBooks = async (params = {}) => {
  const res = await api.get("/admin/books", { params });
  return res.data;
};

// Get a single book by ID (admin)
export const getAdminBookById = async (id) => {
  const res = await api.get(`/admin/books/${id}`);
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
// Get all users
export const getUsers = async (params = {}) => {
  const res = await api.get("/admin/users", { params });
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

// Delete order
export const deleteOrder = async (id) => {
  const res = await api.delete(`/admin/orders/${id}`);
  return res.data;
};

// Delete a user
export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// Delete own account
export const deleteMyAccount = async () => {
  const res = await api.delete("/auth/me");
  return res.data;
};

// Update user role (user <-> author)
export const updateUserRole = async (id, role) => {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data;
};

// Author dashboard
export const getAuthorDashboard = async () => {
  const res = await api.get("/author/dashboard");
  return res.data;
};

// ── Author Book Submission ──────────────────────────────
export const previewAuthorBookContract = async (data) => {
  const res = await api.post("/author/books/preview-contract", data);
  return res.data;
};

export const submitAuthorBook = async (formData) => {
  const res = await api.post("/author/books", formData);
  return res.data;
};

export const getMyAuthorBooks = async () => {
  const res = await api.get("/author/books");
  return res.data;
};

export const updateAuthorBook = async (id, formData) => {
  const res = await api.put(`/author/books/${id}`, formData);
  return res.data;
};

export const deleteAuthorBook = async (id) => {
  const res = await api.delete(`/author/books/${id}`);
  return res.data;
};

// ── Admin Approve / Reject ──────────────────────────────
export const approveBook = async (id) => {
  const res = await api.patch(`/admin/books/${id}/approve`);
  return res.data;
};

export const rejectBook = async (id, reason = "") => {
  const res = await api.patch(`/admin/books/${id}/reject`, { reason });
  return res.data;
};

export const getPendingBooks = async () => {
  const res = await api.get("/admin/books", { params: { approvalStatus: "pending", pageSize: 100 } });
  return res.data;
};

// ── Contract PDF ────────────────────────────────────────
export const getAdminBookContract = async (id) => {
  const res = await api.get(`/admin/books/${id}/contract`);
  return res.data;
};

export const getAuthorBookContract = async (id) => {
  const res = await api.get(`/author/books/${id}/contract`);
  return res.data;
};

