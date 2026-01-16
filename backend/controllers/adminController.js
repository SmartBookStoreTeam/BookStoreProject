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

    // Upload image to Cloudinary (public is OK for cover images)
    const imageUpload = await uploadToCloudinary(req.files.image[0].buffer, {
      folder: "book-store/images",
    });

    // Upload PDF to S3 and store only the object key in the database
    const pdfUpload = await uploadToS3(
      req.files.pdf[0].buffer,
      req.files.pdf[0].originalname,
      req.files.pdf[0].mimetype,
      { folder: "books", isPublic: false }
    );

    const book = await Book.create({
      title,
      author,
      description,
      category,
      price,
      image: imageUpload.secure_url,
      pdf: pdfUpload.key, // Store the S3 key, not the URL
      fileMeta: {
        size: req.files.pdf[0].size,
        mime: req.files.pdf[0].mimetype,
      },
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a book
// @route   PUT /api/admin/books/:id
// @access  Admin
export const updateBook = async (req, res, next) => {
  try {
    const updateData = {};

    const fields = [
      "title",
      "author",
      "description",
      "category",
      "price",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (req.files?.image?.[0]) {
      const imageUpload = await uploadToCloudinary(req.files.image[0].buffer, {
        folder: "book-store/images",
      });
      updateData.image = imageUpload.secure_url;
    }

    if (req.files?.pdf?.[0]) {
      // Upload PDF to S3 and store only the key in the database
      const pdfUpload = await uploadToS3(
        req.files.pdf[0].buffer,
        req.files.pdf[0].originalname,
        req.files.pdf[0].mimetype,
        { folder: "books", isPublic: false }
      );

      updateData.pdf = pdfUpload.key;
      updateData.fileMeta = {
        size: req.files.pdf[0].size,
        mime: req.files.pdf[0].mimetype,
      };
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({
      success: true,
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
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    return res.json({
      success: true,
      message: "Book disabled successfully",
      data: book,
    });
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
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const q = req.query.q?.trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: users,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
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

export const getAllBooksAdmin = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const q = req.query.q?.trim();
    const isActive = req.query.isActive; // "true" | "false"
    const category = req.query.category;
    const sort = req.query.sort || "-createdAt"; // example: "price" or "-price"

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    if (category) filter.category = category;

    const total = await Book.countDocuments(filter);

    const books = await Book.find(filter)
      .select("-pdf -reviews -__v")
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: books,
      meta: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookAdminById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select("-pdf -__v");
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
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
