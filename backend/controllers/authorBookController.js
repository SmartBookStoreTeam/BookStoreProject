import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import translate from "google-translate-api-x";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { verifyAgainstMultiple } from "../services/signatureService.js"; 
const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/**
 * Build a publishing contract PDF and embed the author's signature image.
 * Returns a Buffer of the signed PDF.
 */
async function buildContractPdf({
  title,
  author,
  price,
  signatureBase64,
  authorEmail,
  date,
}) {
  // Translate Arabic inputs to English for PDF compatibility
  const hasArabic = /[\u0600-\u06FF]/;

  try {
    if (hasArabic.test(title)) {
      const res = await translate(title, { to: "en" });
      title = res.text;
    }
  } catch (err) {
    console.error("Title Translation Error:", err.message);
  }

  try {
    if (hasArabic.test(author)) {
      const res = await translate(author, { to: "en" });
      author = res.text;
    }
  } catch (err) {
    console.error("Author Translation Error:", err.message);
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const draw = (
    text,
    x,
    y,
    size = 12,
    font = timesRomanFont,
    color = rgb(0.1, 0.1, 0.1),
  ) => {
    try {
      page.drawText(text, { x, y, size, font, color });
    } catch (e) {
      // Fallback for non-Latin characters (like Arabic) which StandardFonts cannot encode
      const safeText = text.replace(/[^\x00-\x7F]/g, "?");
      try {
        page.drawText(safeText, { x, y, size, font, color });
      } catch (err2) {
        console.error("PDF Draw error:", err2.message);
      }
    }
  };

  // ── Header ──
  draw(
    "Bookfly Store",
    width / 2 - 90,
    height - 60,
    18,
    timesRomanBold,
    rgb(0.24, 0.32, 0.73),
  );
  draw(
    "Book Publishing Contract",
    width / 2 - 80,
    height - 90,
    14,
    timesRomanFont,
    rgb(0.4, 0.4, 0.4),
  );

  // Divider
  page.drawLine({
    start: { x: 50, y: height - 100 },
    end: { x: width - 50, y: height - 100 },
    thickness: 1,
    color: rgb(0.24, 0.32, 0.73),
  });

  // ── Body ──
  let y = height - 130;
  const lineH = 22;

  draw(`Date: ${date}`, 50, y);
  y -= lineH;
  draw(`Author: ${author}`, 50, y);
  y -= lineH;
  draw(`Email: ${authorEmail}`, 50, y);
  y -= lineH * 1.5;

  draw("Book Details:", 50, y, 13, timesRomanBold);
  y -= lineH;
  draw(`Title: ${title}`, 70, y);
  y -= lineH;
  draw(`Listed Price: ${price} EGP`, 70, y);
  y -= lineH * 2;

  // ── Contract terms ──
  draw("Terms & Conditions:", 50, y, 13, timesRomanBold);
  y -= lineH;
  const terms = [
    "1. The author confirms that they are the sole copyright holder of the submitted book.",
    "2. The author grants Bookfly a non-exclusive licence to distribute and sell the book",
    "   on the platform for the duration of the listing.",
    "3. The platform retains a 20% commission on each sale; 80% goes to the author.",
    "4. The platform reserves the right to review and approve the book before publishing.",
    "5. The author may request removal of the book by contacting support.",
    "6. Any fraudulent content will result in immediate removal and account suspension.",
    "7. By signing this contract the author declares all information provided is accurate.",
  ];
  for (const line of terms) {
    draw(line, 50, y, 10.5);
    y -= 18;
  }

  y -= 20;
  draw("Author Signature:", 50, y, 12, timesRomanBold);
  y -= 10;

  // ── Embed signature image ──
  if (signatureBase64) {
    try {
      const base64Data = signatureBase64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );
      const sigBuffer = Buffer.from(base64Data, "base64");
      const sigImage = await pdfDoc.embedPng(sigBuffer);
      const sigDims = sigImage.scale(0.4);
      page.drawImage(sigImage, {
        x: 50,
        y: y - sigDims.height,
        width: sigDims.width,
        height: sigDims.height,
      });
      y -= sigDims.height + 10;
    } catch (_) {
      draw(
        "[Signature not available]",
        50,
        y - 20,
        10,
        timesRomanFont,
        rgb(0.6, 0.6, 0.6),
      );
      y -= 40;
    }
  }

  // Footer
  page.drawLine({
    start: { x: 50, y: 60 },
    end: { x: width - 50, y: 60 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  draw(
    "Bookfly © " +
      new Date().getFullYear() +
      " — Auto-generated publishing contract",
    50,
    45,
    9,
    timesRomanFont,
    rgb(0.6, 0.6, 0.6),
  );

  return Buffer.from(await pdfDoc.save());
}

// @desc  Author submits a new book (pending approval)
// @route POST /api/author/books
// @access Author
export const submitBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      description,
      price,
      year,
      isbn,
      edition,
      status,
      signature,
    } = req.body;

    const categories = req.body.categories
      ? Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories]
      : [];

    if (categories.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one category is required" });
    }

    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];

    if (!imageFile || !pdfFile) {
      return res
        .status(400)
        .json({ success: false, message: "Image and PDF are required" });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Digital signature is required to publish a book",
      });
    }

    // ==========================================
    // 🛡️ AI SIGNATURE VERIFICATION GATEWAY 🛡️
    // ==========================================

    // 1. Fetch Author's stored signatures from DB
    const authorUser = await User.findById(req.user._id);
    if (
      !authorUser ||
      !authorUser.signatures ||
      authorUser.signatures.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Security Error: No baseline signatures found for this author.",
      });
    }

    // 2. Convert incoming base64 signature into a Buffer for the AI
    const sigBase64 = signature.replace(/^data:image\/\w+;base64,/, "");
    const sigBuffer = Buffer.from(sigBase64, "base64");

    // 3. Extract the Cloudinary URLs of the 3 stored signatures
    const storedSignatureUrls = authorUser.signatures.map((sig) => sig.url);

    // 4. Run the AI Verification
    const aiResult = await verifyAgainstMultiple(
      storedSignatureUrls,
      sigBuffer,
    );

    if (!aiResult.verified) {
      return res.status(401).json({
        success: false,
        message: "AI Security Alert: " + aiResult.message,
        matchesFound: `${aiResult.matchesFound} out of ${aiResult.totalChecks}`,
      });
    }

    // ==========================================
    // ✅ PASSED AI CHECK - PROCEED WITH UPLOADS
    // ==========================================

    // Count PDF pages
    const pdfDoc = await PDFDocument.load(pdfFile.buffer);
    const pageCount = pdfDoc.getPageCount();

    // Upload image to Cloudinary
    const imageUpload = await uploadToCloudinary(imageFile.buffer, {
      folder: "book-store/images",
    });

    // Upload verified signature image to Cloudinary
    const signatureUpload = await uploadToCloudinary(sigBuffer, {
      folder: "book-store/signatures",
      resource_type: "image",
    });

    // Create book with pending status
    const book = await Book.create({
      title,
      author,
      description,
      year,
      categories,
      isbn,
      edition: edition || "",
      price: Number(price),
      status: status || "available",
      image: imageUpload.secure_url,
      pdf: "temp",
      s3Folder: null,
      aiMetaKey: null,
      approvalStatus: "pending",
      isActive: false,
      submittedBy: req.user._id,
      signatureUrl: signatureUpload.secure_url,
      contractSignedAt: new Date(),
    });

    // Build S3 folder name
    const shortId = book._id.toString().slice(-6);
    const folderId = `${slugify(`${title}-${author}-${year || ""}`)}-${shortId}`;

    // Upload book PDF to S3
    const pdfUpload = await uploadToS3(
      pdfFile.buffer,
      "book.pdf",
      pdfFile.mimetype,
      { folder: "books", subfolder: folderId },
    );

    // Build and upload contract PDF to S3
    const contractBuffer = await buildContractPdf({
      title,
      author,
      price: Number(price),
      signatureBase64: signature,
      authorEmail: req.user.email,
      date: new Date().toLocaleDateString("en-GB"),
    });

    const contractUpload = await uploadToS3(
      contractBuffer,
      "contract.pdf",
      "application/pdf",
      { folder: "books", subfolder: folderId },
    );

    // Update book with real data
    book.pdf = pdfUpload.key;
    book.fileMeta = {
      size: pdfFile.size,
      mime: pdfFile.mimetype,
      pages: pageCount,
    };
    book.s3Folder = folderId;
    book.contractPdf = contractUpload.key;

    await book.save();

    res.status(201).json({
      success: true,
      message: "Identity Verified & Book submitted for approval",
      aiData: aiResult,
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get author's own submitted books (all statuses)

// @route GET /api/author/books
// @access Author
export const getMyBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ submittedBy: req.user._id })
      .select("+contractPdf")
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

// @desc  Author edits their book (only if pending or rejected)
// @route PUT /api/author/books/:id
// @access Author
export const editMyBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      submittedBy: req.user._id,
    });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const isApproved =
      book.approvalStatus === "approved" || book.isActive === true;

    const { title, author, description, price, year, isbn, edition, status } =
      req.body;

    const categories = req.body.categories
      ? Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories]
      : [];

    const updates = {};
    if (title) updates.title = title;
    if (author) updates.author = author;
    if (description) updates.description = description;
    if (price) updates.price = Number(price);
    if (year) updates.year = year;
    if (isbn) updates.isbn = isbn;
    if (edition !== undefined) updates.edition = edition;
    if (status) updates.status = status;
    if (categories.length > 0) updates.categories = categories;

    // Re-upload image if provided
    if (req.files?.image?.[0]) {
      const imageUpload = await uploadToCloudinary(req.files.image[0].buffer, {
        folder: "book-store/images",
      });
      updates.image = imageUpload.secure_url;
    }

    // Re-upload PDF if provided
    if (req.files?.pdf?.[0]) {
      const pdfDoc = await PDFDocument.load(req.files.pdf[0].buffer);
      const pageCount = pdfDoc.getPageCount();

      const pdfUpload = await uploadToS3(
        req.files.pdf[0].buffer,
        "book.pdf",
        req.files.pdf[0].mimetype,
        { folder: "books", subfolder: book.s3Folder || book._id.toString() },
      );
      updates.pdf = pdfUpload.key;
      updates.fileMeta = {
        size: req.files.pdf[0].size,
        mime: req.files.pdf[0].mimetype,
        pages: pageCount,
      };
    }

    if (isApproved) {
      // Save changes to draft
      book.pendingEdits = updates;
      book.approvalStatus = "pending";
      book.rejectionReason = null;
      // Do NOT change isActive so it stays live in the store
    } else {
      // Apply directly
      Object.assign(book, updates);
      book.approvalStatus = "pending";
      book.rejectionReason = null;
      book.isActive = false;
    }

    await book.save();

    res.json({
      success: true,
      message: "Book updated, pending approval",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Author deletes their own book (only if pending or rejected)
// @route DELETE /api/author/books/:id
// @access Author
export const deleteMyBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      submittedBy: req.user._id,
    });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (book.approvalStatus === "approved") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete an approved book. Contact admin.",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc  Get signed URL for author's own book contract
// @route GET /api/author/books/:id/contract
// @access Author (owner only)
export const getMyBookContract = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      submittedBy: req.user._id,
    }).select("+contractPdf signatureUrl contractSignedAt");

    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    if (!book.contractPdf)
      return res
        .status(404)
        .json({ success: false, message: "No contract found for this book" });

    const { getSignedReadUrl } = await import("../utils/getSignedUrl.js");
    const url = await getSignedReadUrl(book.contractPdf, 60 * 15);

    res.json({
      success: true,
      data: {
        url,
        signatureUrl: book.signatureUrl || null,
        contractSignedAt: book.contractSignedAt || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Generate a preview PDF of the publishing contract based on user input
// @route POST /api/author/books/preview-contract
// @access Author
export const previewContractPDF = async (req, res, next) => {
  try {
    const { title, price, signatureBase64 } = req.body;

    // Create the PDF buffer
    const contractBuffer = await buildContractPdf({
      title: title || "Untitled Book",
      author: req.user.name,
      price: price || 0,
      signatureBase64,
      authorEmail: req.user.email,
      date: new Date().toLocaleDateString("en-GB"),
    });

    // Return base64 string
    const base64Pdf = contractBuffer.toString("base64");
    const dataUri = `data:application/pdf;base64,${base64Pdf}`;

    res.json({ success: true, pdfUrl: dataUri });
  } catch (err) {
    next(err);
  }
};
