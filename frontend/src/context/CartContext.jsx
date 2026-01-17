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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      dispatch({ type: "LOAD_CART", payload: savedCart });
    }
  }, []);

  const addToCart = (book) => {
    const bookId = generateBookId(book);
    const existingItem = cartItems.find((item) => item.id === bookId);

    if (existingItem) {
      // Book already in cart
      return { success: false, alreadyInCart: true };
    }

    dispatch({ type: "ADD_TO_CART", payload: book });
    return { success: true, alreadyInCart: false };
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
    let newState;

    switch (action.type) {
      case "ADD_PURCHASED_BOOKS": {
        // Add new purchased books with purchase timestamp, avoiding duplicates
        const newBooks = action.payload
          .filter((newBook) => {
            const isDuplicate = state.some(
              (existingBook) =>
                existingBook._id === newBook._id ||
                existingBook.id === newBook._id ||
                existingBook._id === newBook.id ||
                existingBook.id === newBook.id,
            );
            return !isDuplicate;
          })
          .map((book) => ({
            ...book,
            purchasedAt: new Date().toISOString(),
          }));

        newState = [...state, ...newBooks];
        break;
      }

      case "LOAD_PURCHASED_BOOKS": {
        newState = action.payload;
        break;
      }

      default:
        return state;
    }

    // Save to localStorage
    localStorage.setItem("purchasedBooks", JSON.stringify(newState));
    return newState;
  };

  // Load purchased books from localStorage
  const loadPurchasedBooksFromStorage = () => {
    try {
      const saved = localStorage.getItem("purchasedBooks");
      if (!saved) return [];
      const books = JSON.parse(saved);

      // Deduplicate loaded books
      const uniqueBooks = [];
      const seenIds = new Set();

      books.forEach((book) => {
        // Use a consistent ID check similar to isBookPurchased
        const id = book._id || book.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          uniqueBooks.push(book);
        } else if (!id) {
          // Keep books without ID just in case, or maybe filter them?
          // Better to keep unique based on full object if ID missing?
          // For now assuming ID exists as per app logic.
          // If no ID, we might allow it or skip it. Let's skip to be safe against bad data.
        }
      });

      // If we filtered out duplicates, update localStorage immediately to clean it up
      if (uniqueBooks.length !== books.length) {
        localStorage.setItem("purchasedBooks", JSON.stringify(uniqueBooks));
      }

      return uniqueBooks;
    } catch (error) {
      console.error("Error loading purchasedBooks from localStorage:", error);
      return [];
    }
  };

  const [purchasedBooks, purchasedBooksDispatch] = useReducer(
    purchasedBooksReducer,
    null,
    loadPurchasedBooksFromStorage,
  );

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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
