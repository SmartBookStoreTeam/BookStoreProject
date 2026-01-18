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
    const book = await Book.findById(req.params.id).select("+previewPdf title");

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (!book.previewPdf) {
      return res
        .status(404)
        .json({ success: false, message: "Preview not available" });
    }

    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: book.previewPdf,
      Expires: 30, // short expiry for preview
      ResponseContentDisposition: "inline",
      ResponseContentType: "application/pdf",
    });

    return res.json({ success: true, data: { url: signedUrl } });
  } catch (err) {
    next(err);
  }
};
