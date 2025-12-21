import { createContext, useReducer, useEffect } from "react";

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
        newState = state.map((item) =>
          item.id === bookId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newState = [
          ...state,
          {
            ...action.payload,
            // Preserve the original _id for navigation to book details
            _id: action.payload._id || action.payload.id,
            id: bookId,
            quantity: 1,
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
            : item
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      dispatch({ type: "LOAD_CART", payload: savedCart });
    }
  }, []);

  const addToCart = (book) => {
    dispatch({ type: "ADD_TO_CART", payload: book });
  };

  const removeFromCart = (id) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
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
  // Add to your CartProvider
  const [userBooks, userBooksDispatch] = useReducer(userBooksReducer, []);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedUserBooks = localStorage.getItem("userBooks");
    if (savedUserBooks) {
      userBooksDispatch({
        type: "LOAD_USER_BOOKS",
        payload: JSON.parse(savedUserBooks),
      });
    }
  }, []);

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

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    addUserBook,
    userBooks,
    removeUserBook,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
