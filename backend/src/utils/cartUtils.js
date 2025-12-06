// utils/cartUtils.js
// Utility functions for cart operations

export const generateBookId = (book) => {
  return (
    book.id ||
    `${book.title}-${book.author}-${Math.random().toString(36).slice(2, 9)}`
  );
};

export const calculateItemTotal = (price, quantity) => {
  return price * quantity;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
};
