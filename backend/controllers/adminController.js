import { PDFDocument } from "pdf-lib";
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
    const { title, author, description, category, price, year, isbn, edition } =
      req.body;

    if (!title || !author || !description || !category || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.files?.image?.[0] || !req.files?.pdf?.[0]) {
      return res.status(400).json({ message: "Image and PDF are required" });
    }

    const pdfBuffer = req.files.pdf[0].buffer;
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // 2. رفع الصورة لـ Cloudinary
    const imageUpload = await uploadToCloudinary(req.files.image[0].buffer, {
      folder: "book-store/images",
    });

    // 3. رفع ملف الـ PDF الأصلي لـ S3
    const pdfUpload = await uploadToS3(
      pdfBuffer,
      req.files.pdf[0].originalname,
      req.files.pdf[0].mimetype,
      { folder: "books", isPublic: false },
    );

    // 4. معالجة ملف الـ Preview (اختياري)
    let previewKey = null;
    let previewPages = null;

    if (req.files?.previewPdf?.[0]) {
      const previewBuffer = req.files.previewPdf[0].buffer;

      // استخراج صفحات الـ preview بنفس الطريقة
      const previewPdfDoc = await PDFDocument.load(previewBuffer);
      previewPages = previewPdfDoc.getPageCount();

      const previewUpload = await uploadToS3(
        previewBuffer,
        req.files.previewPdf[0].originalname,
        req.files.previewPdf[0].mimetype,
        { folder: "previews", isPublic: false },
      );
      previewKey = previewUpload.key;
    }

    // 5. حفظ في قاعدة البيانات

    const book = await Book.create({
      title,
      author,
      description,
      year,
      category,
      isbn,
      edition: edition || "",
      price: Number(price),
      image: imageUpload.secure_url,

      pdf: pdfUpload.key, // Store the S3 key, not the URL

      pdf: pdfUpload.key,
      previewPdf: previewKey,

      fileMeta: {
        size: req.files.pdf[0].size,
        mime: req.files.pdf[0].mimetype,
        pages: pageCount,
      },
      previewMeta: previewKey
        ? {
            size: req.files.previewPdf[0].size,
            mime: req.files.previewPdf[0].mimetype,
            pages: previewPages,
          }
        : null,
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (err) {
    console.error("Error creating book:", err);
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
      "year",
      "isActive",
      "status",
      "isbn",
      "edition",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Ensure edition is stored as a String (no transformation needed)
        updateData[field] = req.body[field];
      }
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
        { folder: "books", isPublic: false },
      );

      if (req.files?.previewPdf?.[0]) {
        const previewUpload = await uploadToS3(
          req.files.previewPdf[0].buffer,
          req.files.previewPdf[0].originalname,
          req.files.previewPdf[0].mimetype,
          { folder: "previews", isPublic: false },
        );

        updateData.previewPdf = previewUpload.key;
      }

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
      },
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
      { new: true },
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

// @desc    Get all users with orders count and total spent
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const q = req.query.q?.trim();

    const matchFilter = {};
    if (q) {
      matchFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // Count total users matching filter
    const total = await User.countDocuments(matchFilter);

    // Aggregate users with their order statistics
    const users = await User.aggregate([
      // Match users based on filter
      { $match: matchFilter },
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      // Skip and limit for pagination
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
      // Lookup orders for each user
      {
        $lookup: {
          from: "orders", // collection name in MongoDB
          localField: "_id",
          foreignField: "user",
          as: "userOrders",
        },
      },
      // Calculate order statistics
      {
        $addFields: {
          ordersCount: { $size: "$userOrders" },
          totalSpent: {
            $sum: {
              $map: {
                input: "$userOrders",
                as: "order",
                in: "$$order.total",
              },
            },
          },
        },
      },
      // Remove password and orders array from output
      {
        $project: {
          password: 0,
          userOrders: 0,
        },
      },
    ]);

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
      .populate("category", "name slug")
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
    const book = await Book.findById(req.params.id).select("+pdf -__v");
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
