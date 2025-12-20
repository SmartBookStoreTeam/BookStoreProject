import Book from "../models/Book.js";
import User from "../models/User.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

// =======================
// Book CRUD (Admin Only)
// =======================

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Admin

export const createBook = async (req, res, next) => {
  try {
    const { title, author, description, category, price } = req.body;

    if (!req.files?.image || !req.files?.pdf) {
      throw new Error("Image and PDF are required");
    }

    // رفع الصورة على Cloudinary
    const imageUpload = await uploadToCloudinary(req.files.image[0].buffer, {
      folder: "book-store/images",
    });

    // رفع PDF على S3
    const pdfUrl = await uploadToS3(
      req.files.pdf[0].buffer,
      req.files.pdf[0].originalname,
      req.files.pdf[0].mimetype
    );

    const book = await Book.create({
      title,
      author,
      description,
      category,
      price,
      image: imageUpload.secure_url, // رابط Cloudinary
      pdf: pdfUrl, // رابط S3
    });

    res.status(201).json(book);
  } catch (err) {
    next(err);
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

    const fields = [
      "title",
      "author",
      "description",
      "category",
      "price",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    if (req.files?.image) {
      book.image = req.files.image[0].path;
    }

    if (req.files?.pdf) {
      book.pdf = req.files.pdf[0].path;
    }

    const updatedBook = await book.save();

    res.json({
      message: "Book updated successfully",
      updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable a book (Soft delete)
// @route   DELETE /api/admin/books/:id
// @access  Admin
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    book.isActive = false;
    await book.save();

    res.json({ message: "Book disabled successfully" });
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
