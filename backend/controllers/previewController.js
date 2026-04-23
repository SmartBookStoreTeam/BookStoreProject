import AWS from "aws-sdk";
import Book from "../models/Book.js";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  httpOptions: { timeout: 0 }, // disable timeout — large PDFs need more time
});

const extractKey = (pdf) => {
  let key = pdf;
  if (key.startsWith("http")) {
    const marker = ".amazonaws.com/";
    const idx = key.indexOf(marker);
    if (idx !== -1) key = key.slice(idx + marker.length);
  }
  return decodeURIComponent(key);
};

export const previewBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select("+pdf title");
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    if (!book.pdf) return res.status(404).json({ success: false, message: "PDF not available" });

    const key = extractKey(book.pdf);
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 30,
      ResponseContentDisposition: "inline",
      ResponseContentType: "application/pdf",
    });

    return res.json({ success: true, data: { url: signedUrl } });
  } catch (err) {
    next(err);
  }
};

/**
 * Stream the actual PDF binary through the backend (bypasses S3 CORS).
 * Sends Content-Length so the browser can show real download progress.
 */
export const streamBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select("+pdf title");
    if (!book || !book.pdf) {
      return res.status(404).json({ success: false, message: "PDF not available" });
    }

    const key = extractKey(book.pdf);
    const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: key };

    // Get file size so the browser can show a real progress bar
    try {
      const head = await s3.headObject(params).promise();
      if (head.ContentLength) res.setHeader("Content-Length", head.ContentLength);
    } catch { /* not critical */ }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");

    const stream = s3.getObject(params).createReadStream();
    stream.on("error", (err) => {
      const silentCodes = ["ECONNRESET", "TimeoutError", "RequestTimeTooSkewed"];
      if (!silentCodes.includes(err.code) && err.message !== "aborted") {
        console.error("S3 stream error:", err);
      }
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Failed to stream PDF" });
      }
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
