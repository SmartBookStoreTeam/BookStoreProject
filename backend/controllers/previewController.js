import AWS from "aws-sdk";
import Book from "../models/Book.js";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export const previewBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select("+pdf title");

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (!book.pdf) {
      return res
        .status(404)
        .json({ success: false, message: "PDF not available" });
    }

    // Extract S3 key if stored as relative path
    let key = book.pdf;
    if (!key.startsWith("http")) {
      // Already a key like "books/123.pdf"
      key = book.pdf;
    } else {
      // If stored as full S3 URL, extract the path
      const marker = ".amazonaws.com/";
      const idx = key.indexOf(marker);
      if (idx !== -1) {
        key = key.slice(idx + marker.length);
      }
    }

    // ✅ Decode key to avoid double encoding (e.g. %20 -> space)
    // S3 requires the raw key name (e.g. "my file.pdf") not "my%20file.pdf"
    key = decodeURIComponent(key);

    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 30, // 30 minutes for preview
      ResponseContentDisposition: "inline",
      ResponseContentType: "application/pdf",
    });

    return res.json({ success: true, data: { url: signedUrl } });
  } catch (err) {
    next(err);
  }
};
