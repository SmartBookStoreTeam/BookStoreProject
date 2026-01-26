import { PDFDocument } from "pdf-lib";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"; // Added S3 imports
import cloudinary from "cloudinary"; // Ensure cloudinary is imported
import Book from "../models/Book.js";
import User from "../models/User.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// Helper to extract Cloudinary public_id from a URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
  return publicIdWithExt.split(".")[0];
};

// =======================
// Book CRUD (Admin Only)
// =======================

// @desc    Create a new book
export const createBook = async (req, res, next) => {
  try {
    const { title, author, description, category, price, year, isbn, edition } =
      req.body;

    if (!title || !author || !description || !category || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];
    const previewFile = req.files?.previewPdf?.[0];

    if (!imageFile || !pdfFile) {
      return res.status(400).json({ message: "Image and PDF are required" });
    }

    // 1) استخراج عدد الصفحات من الـ PDF الأصلي
    const pdfDoc = await PDFDocument.load(pdfFile.buffer);
    const pageCount = pdfDoc.getPageCount();

    // 2) رفع الصورة لـ Cloudinary
    const imageUpload = await uploadToCloudinary(imageFile.buffer, {
      folder: "book-store/images",
    });

    // 3) رفع ملف الـ PDF الأصلي لـ S3 (كـ file object)
    const pdfUpload = await uploadToS3(
      pdfFile.buffer,
      pdfFile.originalname,
      pdfFile.mimetype,
      { folder: "books", isPublic: false },
    );

    // 4) رفع ملف الـ Preview (اختياري)
    let previewKey = null;
    let previewPages = null;

    if (previewFile) {
      const previewDoc = await PDFDocument.load(previewFile.buffer);
      previewPages = previewDoc.getPageCount();

      const previewUpload = await uploadToS3(
        previewFile.buffer,
        previewFile.originalname,
        previewFile.mimetype,
        { folder: "previews", isPublic: false },
      );

      previewKey = previewUpload.key;
    }

    // 5) حفظ في قاعدة البيانات
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

      // IMPORTANT: pdf field مرة واحدة فقط
      pdf: pdfUpload.key,
      previewPdf: previewKey,
      fileMeta: {
        size: pdfFile.size,
        mime: pdfFile.mimetype,
        pages: pageCount,
      },

      previewMeta: previewKey
        ? {
            size: previewFile.size,
            mime: previewFile.mimetype,
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

    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    res.json({
      success: true,
      message: "Book updated successfully",
      updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    PERMANENT DELETE (Cloudinary + S3 + MongoDB)
// @route   DELETE /api/admin/books/:id
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select("+pdf +previewPdf");

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // 1. Delete Cover Image from Cloudinary
    if (book.image) {
      const publicId = getPublicIdFromUrl(book.image);
      if (publicId) {
        await cloudinary.v2.uploader.destroy(publicId);
      }
    }

    // 2. Delete PDF and Metadata from S3
    if (book.pdf) {
      // Delete the main PDF
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: book.pdf,
        }),
      );

      // Delete the Knowledge Base metadata file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${book.pdf}.metadata.json`,
        }),
      );
    }

    // 3. Delete Preview PDF from S3 if it exists
    if (book.previewPdf) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: book.previewPdf,
        }),
      );
    }

    // 4. Remove from MongoDB
    await Book.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Book and all associated cloud files deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    next(error);
  }
};

// =======================
// User Management (Admin Only)
// =======================

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

    const total = await User.countDocuments(matchFilter);

    const users = await User.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "userOrders",
        },
      },
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
      meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};

// =======================
// Book Fetching (Admin)
// =======================

export const getAllBooksAdmin = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const q = req.query.q?.trim();
    const isActive = req.query.isActive;
    const category = req.query.category;
    const sort = req.query.sort || "-createdAt";

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
      .select("-reviews -__v")
      .populate("category", "name slug")
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: books,
      meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
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
