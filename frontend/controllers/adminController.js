import Book from "../models/Book.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// =======================
// Book CRUD (Admin Only)
// =======================

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Admin
export const createBook = async (req, res, next) => {
  try {
    // /////// image ////////
    const { title, author, description, category, price } = req.body;

    if (!title || !author || !description || !category || !price) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const book = await Book.create({
      title,
      author,
      description,
      category,
      price,
    });

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/admin/books/:id
// @access  Admin
export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    Object.assign(book, req.body); // تحديث كل الحقول المرسلة
    const updatedBook = await book.save();
    res.json({ message: "Book Updated successfully", updatedBook });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/admin/books/:id
// @access  Admin
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    res.json({ message: "Book removed successfully" });
  } catch (error) {
    next(error);
  }
};

// =======================
// User Management (Admin Only)
// =======================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};

// =======================
// Order Management (Admin Only)
// =======================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an order
// @route   PATCH /api/admin/orders/:id/approve
// @access  Admin
export const approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = "approved";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an order
// @route   PATCH /api/admin/orders/:id/reject
// @access  Admin
export const rejectOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = "rejected";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Admin

//  >>>>> Will do this from mongo DB <<<<<<<<<

// export const updateUserRole = async (req, res, next) => {
//   try {
//     const { role } = req.body;
//     if (!["user", "admin"].includes(role)) {
//       res.status(400);
//       throw new Error("Invalid role");
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       res.status(404);
//       throw new Error("User not found");
//     }

//     user.role = role;
//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } catch (error) {
//     next(error);
//   }
// };
