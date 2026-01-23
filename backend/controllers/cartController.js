import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

// @desc    Get my cart
// @route   GET /api/cart
// @access  Private
export const getMyCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.book",
      select: "title author price image isActive",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Filter out inactive books
    cart.items = cart.items.filter(
      (item) => item.book && item.book.isActive !== false
    );

    res.json({
      success: true,
      data: cart.items.map((item) => ({
        _id: item.book._id,
        id: `${item.book.title.toLowerCase().replace(/\s+/g, "-")}-${item.book.author.toLowerCase().replace(/\s+/g, "-")}`,
        title: item.book.title,
        author: item.book.author,
        price: item.book.price,
        image: item.book.image,
        img: item.book.image,
        quantity: item.quantity,
        addedAt: item.addedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!bookId) {
      return res.status(400).json({ success: false, message: "Book ID is required" });
    }

    // Verify book exists and is active
    const book = await Book.findById(bookId).select("title isActive");
    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: "Book not found or not available" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if book already in cart
    const existingItem = cart.items.find(
      (item) => item.book.toString() === bookId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Book already in cart",
        alreadyInCart: true,
      });
    }

    // Add book to cart
    cart.items.push({
      book: bookId,
      quantity: 1,
      addedAt: new Date(),
    });

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: "items.book",
      select: "title author price image",
    });

    res.status(201).json({
      success: true,
      message: "Book added to cart",
      data: cart.items,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.book.toString() !== bookId
    );

    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart.items,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:bookId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Find and update item
    const item = cart.items.find(
      (item) => item.book.toString() === bookId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: "Cart updated",
      data: cart.items,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.json({ success: true, message: "Cart already empty" });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync cart from localStorage
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid items" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Merge items from localStorage
    for (const localItem of items) {
      const bookId = localItem._id || localItem.id;
      
      // Verify book exists
      const book = await Book.findById(bookId).select("_id isActive");
      if (!book || book.isActive === false) continue;

      // Check if already in cart
      const exists = cart.items.find(
        (item) => item.book.toString() === bookId
      );

      if (!exists) {
        cart.items.push({
          book: bookId,
          quantity: localItem.quantity || 1,
          addedAt: new Date(),
        });
      }
    }

    await cart.save();

    // Return updated cart
    await cart.populate({
      path: "items.book",
      select: "title author price image",
    });

    res.json({
      success: true,
      message: "Cart synced",
      data: cart.items,
    });
  } catch (err) {
    next(err);
  }
};
