import api from "./api";

// Get author dashboard stats
export const getAuthorDashboard = async () => {
  const res = await api.get("/author/dashboard");
  return res.data;
};

// Author profile / application status
export const getMyAuthorApplication = async () => {
  const res = await api.get("/author-applications/my");
  return res.data;
};

// Submission related
export const submitAuthorBook = async (formData) => {
  const res = await api.post("/author/books", formData);
  return res.data;
};

export const getMyAuthorBooks = async () => {
  const res = await api.get("/author/books");
  return res.data;
};
