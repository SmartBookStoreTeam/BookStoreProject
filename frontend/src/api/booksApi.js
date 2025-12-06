import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Get all books
export const getBooks = async () => {
  const res = await api.get("/books");
  return res.data;
};
