import { createContext, useReducer, useEffect } from "react";
import { getMyLibrary } from "../api/ordersApi";
import { useAuth } from "../context/AuthContext";
import * as cartApi from "../api/cartApi";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

// Load initial state from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("bookCart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

// Generate consistent book ID based on title and author
const generateBookId = (book) => {
  return `${book.title.toLowerCase().replace(/\s+/g, "-")}-${book.author
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
};

const cartReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case "ADD_TO_CART": {
      const bookId = generateBookId(action.payload);
      const existingItem = state.find((item) => item.id === bookId);

      if (existingItem) {
        // Book already in cart - don't add again (digital product)
        // Return same state without changes
        return state;
      } else {
        newState = [
          ...state,
          {
            ...action.payload,
            // Preserve the original _id for navigation to book details
            _id: action.payload._id || action.payload.id,
            id: bookId,
            quantity: 1, // Always 1 for digital books
          },
        ];
      }

      // Save to localStorage after every state change
      localStorage.setItem("bookCart", JSON.stringify(newState));
      return newState;
    }

    case "REMOVE_FROM_CART": {
      newState = state.filter((item) => item.id !== action.payload);
      localStorage.setItem("bookCart", JSON.stringify(newState));
      return newState;
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity < 1) {
        newState = state.filter((item) => item.id !== action.payload.id);
      } else {
        newState = state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item,
        );
      }
      localStorage.setItem("bookCart", JSON.stringify(newState));
      return newState;
    }

    case "CLEAR_CART": {
      localStorage.removeItem("bookCart");
      return [];
    }

    case "LOAD_CART": {
      return action.payload;
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const { user } = useAuth() || {};

  // Fetch cart from API for logged-in users
  const fetchCartFromAPI = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.success && Array.isArray(response.data)) {
        dispatch({ type: "LOAD_CART", payload: response.data });
      }
    } catch (error) {
      console.error("Error fetching cart from API:", error);
      // Fallback to localStorage
      const savedCart = loadCartFromStorage();
      if (savedCart.length > 0) {
        dispatch({ type: "LOAD_CART", payload: savedCart });
      }
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    if (user) {
      // User logged in - fetch from API and sync localStorage
      fetchCartFromAPI();

      // Sync localStorage cart to server
      const localCart = loadCartFromStorage();
      if (localCart.length > 0) {
        cartApi
          .syncCart(localCart)
          .then((response) => {
            if (response.success) {
              // Clear localStorage after successful sync
              localStorage.removeItem("bookCart");
              // Refresh cart from server
              fetchCartFromAPI();
            }
          })
          .catch((err) => {
            console.error("Error syncing cart:", err);
          });
      }
    } else {
      // Guest user - load from localStorage
      const savedCart = loadCartFromStorage();
      if (savedCart.length > 0) {
        dispatch({ type: "LOAD_CART", payload: savedCart });
      }
    }
  }, [user]);

  const addToCart = async (book) => {
    const bookId = generateBookId(book);
    const existingItem = cartItems.find((item) => item.id === bookId);

    if (existingItem) {
      return { success: false, alreadyInCart: true };
    }

    // For logged-in users, save to API
    if (user) {
      try {
        const response = await cartApi.addToCart(book._id || book.id);
        if (response.success) {
          await fetchCartFromAPI();
          return { success: true, alreadyInCart: false };
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Fallback to localStorage
      }
    }

    // For guest users or on API failure, save to localStorage
    dispatch({ type: "ADD_TO_CART", payload: book });
    return { success: true, alreadyInCart: false };
  };

  const removeFromCart = async (id) => {
    // For logged-in users, remove from API
    if (user) {
      try {
        // Find the book's _id from cart
        const item = cartItems.find((item) => item.id === id);
        if (item) {
          await cartApi.removeFromCart(item._id);
          await fetchCartFromAPI();
          return;
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }

    // For guest users or on API failure
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateQuantity = async (id, quantity) => {
    // For logged-in users, update via API
    if (user) {
      try {
        const item = cartItems.find((item) => item.id === id);
        if (item) {
          await cartApi.updateCartItem(item._id, quantity);
          await fetchCartFromAPI();
          return;
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    }

    // For guest users or on API failure
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = async () => {
    // For logged-in users, clear via API
    if (user) {
      try {
        await cartApi.clearCart();
        dispatch({ type: "CLEAR_CART" });
        return;
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }

    // For guest users or on API failure
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // User Books fun
  const userBooksReducer = (state, action) => {
    let newState;

    switch (action.type) {
      case "ADD_USER_BOOK": {
        const newBook = {
          ...action.payload,
          id: `user-${Date.now()}`,
          listedAt: new Date().toISOString(),
        };
        newState = [...state, newBook];
        break;
      }

      case "REMOVE_USER_BOOK": {
        newState = state.filter((book) => book.id !== action.payload);
        break;
      }

      case "LOAD_USER_BOOKS": {
        newState = action.payload;
        break;
      }

      default:
        return state;
    }

    // Save to localStorage
    localStorage.setItem("userBooks", JSON.stringify(newState));
    return newState;
  };
  // Load userBooks from localStorage synchronously
  const loadUserBooksFromStorage = () => {
    try {
      const saved = localStorage.getItem("userBooks");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading userBooks from localStorage:", error);
      return [];
    }
  };

  // Add to your CartProvider - loads synchronously from localStorage
  const [userBooks, userBooksDispatch] = useReducer(
    userBooksReducer,
    null,
    loadUserBooksFromStorage,
  );

  const addUserBook = (bookData) => {
    // Add logic to save user book
    const bookWithId = {
      ...bookData,
      id: `user-${Date.now()}`,
      listedAt: new Date().toISOString(),
    };
    userBooksDispatch({ type: "ADD_USER_BOOK", payload: bookWithId });
  };

  const removeUserBook = (bookId) => {
    userBooksDispatch({ type: "REMOVE_USER_BOOK", payload: bookId });
  };

  const getCheckoutData = () => {
    return {
      items: cartItems,
      total: getCartTotal(),
      isDigitalOnly: true, // All books are PDF for now
    };
  };

  // Purchased Books functionality
  const purchasedBooksReducer = (state, action) => {
    switch (action.type) {
      case "SET_PURCHASED_BOOKS": {
        return action.payload;
      }

      case "ADD_PURCHASED_BOOKS": {
        // Add new purchased books, avoiding duplicates
        const newBooks = action.payload.filter((newBook) => {
          const isDuplicate = state.some(
            (existingBook) =>
              existingBook._id === newBook._id ||
              existingBook.id === newBook._id ||
              existingBook._id === newBook.id ||
              existingBook.id === newBook.id,
          );
          return !isDuplicate;
        });

        return [...state, ...newBooks];
      }

      default:
        return state;
    }
  };

  // Initialize purchased books with empty array
  const [purchasedBooks, purchasedBooksDispatch] = useReducer(
    purchasedBooksReducer,
    [],
  );

  // Fetch purchased books from API
  const fetchPurchasedBooks = async () => {
    try {
      const response = await getMyLibrary();
      if (response.success && Array.isArray(response.data)) {
        purchasedBooksDispatch({
          type: "SET_PURCHASED_BOOKS",
          payload: response.data,
        });
      }
    } catch (error) {
      console.error("Error fetching purchased books:", error);
      // If error (like 401), set to empty array
      purchasedBooksDispatch({ type: "SET_PURCHASED_BOOKS", payload: [] });
    }
  };

  // Fetch purchased books when user logs in
  useEffect(() => {
    if (user) {
      fetchPurchasedBooks();
    } else {
      // Clear purchased books when user logs out
      purchasedBooksDispatch({ type: "SET_PURCHASED_BOOKS", payload: [] });
    }
  }, [user]);

  const addPurchasedBooks = (books) => {
    purchasedBooksDispatch({ type: "ADD_PURCHASED_BOOKS", payload: books });
  };
  // Check if a book is purchased
  const isBookPurchased = (bookId) => {
    if (!purchasedBooks || purchasedBooks.length === 0) return false;
    return purchasedBooks.some(
      (book) => book._id === bookId || book.id === bookId,
    );
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCheckoutData,
    addUserBook,
    userBooks,
    removeUserBook,
    purchasedBooks,
    addPurchasedBooks,
    isBookPurchased,
    fetchPurchasedBooks,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
