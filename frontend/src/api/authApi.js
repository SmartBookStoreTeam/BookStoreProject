import api from "./api";

/**
 * Update user profile (name, email, avatar)
 * @param {Object} data - { name, email, avatar }
 * @returns {Promise} - { message, user }
 */
export const updateProfile = async (data) => {
  const res = await api.put("/auth/me", data);
  return res.data;
};

/**
 * Logout user (clears JWT cookie on backend)
 * @returns {Promise} - { message }
 */
export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
