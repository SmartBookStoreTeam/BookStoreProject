
import api from "./api";

// Add a book
export const addBook = async (bookData) => {
  const res = await api.post("/books", bookData);
  return res.data;
};

// Edit a book
export const updateBook = async (id, bookData) => {
  const res = await api.put(`/books/${id}`, bookData);
  return res.data;
};

// Delete a book
export const deleteBook = async (id) => {
  const res = await api.delete(`/books/${id}`);
  return res.data;
};

// Get all users
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};
