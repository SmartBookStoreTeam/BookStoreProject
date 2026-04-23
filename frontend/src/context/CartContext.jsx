import { createContext, useReducer, useEffect, useRef, useCallback } from "react";
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
        return state;
      } else {
        newState = [
          ...state,
          {
            ...action.payload,
            _id: action.payload._id || action.payload.id,
            id: bookId,
            quantity: 1,
          },
        ];
      }

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
  // Prevents a stale fetchCartFromAPI (started before clearCart) from
  // overwriting the empty state after clearCart completes.
  const justClearedRef = useRef(false);

  // Fetch cart from API for logged-in users
  const fetchCartFromAPI = async () => {
    try {
      const response = await cartApi.getCart();
      // If cart was cleared while this request was in-flight, discard result
      if (justClearedRef.current) {
        justClearedRef.current = false;
        return;
      }
      if (response.success && Array.isArray(response.data)) {
        dispatch({ type: "LOAD_CART", payload: response.data });
      }
    } catch (error) {
      console.error("Error fetching cart from API:", error);
      if (justClearedRef.current) {
        justClearedRef.current = false;
        return;
      }
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
      fetchCartFromAPI();

      // Sync localStorage cart to server
      const localCart = loadCartFromStorage();
      if (localCart.length > 0) {
        cartApi
          .syncCart(localCart)
          .then((response) => {
            if (response.success) {
              localStorage.removeItem("bookCart");
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

    if (user) {
      try {
        const response = await cartApi.addToCart(book._id || book.id);
        if (response.success) {
          await fetchCartFromAPI();
          return { success: true, alreadyInCart: false };
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }

    dispatch({ type: "ADD_TO_CART", payload: book });
    return { success: true, alreadyInCart: false };
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
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

    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateQuantity = async (id, quantity) => {
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

    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = async () => {
    justClearedRef.current = true; // block any in-flight fetch from overwriting
    if (user) {
      try {
        await cartApi.clearCart();
        dispatch({ type: "CLEAR_CART" });
        return;
      } catch (error) {
        justClearedRef.current = false;
        console.error("Error clearing cart:", error);
      }
    }

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

  // User Books
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

    localStorage.setItem("userBooks", JSON.stringify(newState));
    return newState;
  };

  const loadUserBooksFromStorage = () => {
    try {
      const saved = localStorage.getItem("userBooks");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading userBooks from localStorage:", error);
      return [];
    }
  };

  const [userBooks, userBooksDispatch] = useReducer(
    userBooksReducer,
    null,
    loadUserBooksFromStorage,
  );

  const addUserBook = (bookData) => {
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
      isDigitalOnly: true,
    };
  };

  // Purchased Books
  const purchasedBooksReducer = (state, action) => {
    switch (action.type) {
      case "SET_PURCHASED_BOOKS": {
        return action.payload;
      }

      case "ADD_PURCHASED_BOOKS": {
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

      case "UPDATE_BOOK_PROGRESS": {
        const { bookId, lastReadPage } = action.payload;
        return state.map((book) => {
          if (book._id === bookId || book.id === bookId) {
            return { ...book, lastReadPage };
          }
          return book;
        });
      }

      default:
        return state;
    }
  };

  const [purchasedBooks, purchasedBooksDispatch] = useReducer(
    purchasedBooksReducer,
    [],
  );

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
      purchasedBooksDispatch({ type: "SET_PURCHASED_BOOKS", payload: [] });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPurchasedBooks();
    } else {
      purchasedBooksDispatch({ type: "SET_PURCHASED_BOOKS", payload: [] });
    }
  }, [user]);

  const addPurchasedBooks = (books) => {
    purchasedBooksDispatch({ type: "ADD_PURCHASED_BOOKS", payload: books });
  };

  const updatePurchasedBookProgress = useCallback((bookId, lastReadPage) => {
    purchasedBooksDispatch({ type: "UPDATE_BOOK_PROGRESS", payload: { bookId, lastReadPage } });
  }, []);

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
    updatePurchasedBookProgress,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
