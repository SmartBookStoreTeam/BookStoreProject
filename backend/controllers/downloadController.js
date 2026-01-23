import AWS from "aws-sdk";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

function extractS3Key(pdfValue = "") {
  // If already a key like "books/123.pdf"
  if (!pdfValue.startsWith("http")) return pdfValue;

  // If stored as full S3 URL, extract the path after the domain
  // Example: https://bucket.s3.region.amazonaws.com/books/file.pdf -> books/file.pdf
  const marker = ".amazonaws.com/";
  const idx = pdfValue.indexOf(marker);
  if (idx === -1) return pdfValue;

  return pdfValue.slice(idx + marker.length);
}

export const downloadBook = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const bookId = req.params.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // Admin users can access any book PDF
    if (req.user.role !== "admin") {
      // For regular users, check ownership
      const owned = await LibraryItem.findOne({
        user: userId,
        book: bookId,
        accessStatus: "active",
      })
        .select("_id")
        .lean();

      if (!owned)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    const book = await Book.findById(bookId).select("+pdf title");
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    const key = extractS3Key(book.pdf);

    if (!key) {
      return res.status(500).json({
        success: false,
        message: "Book PDF key is missing",
      });
    }

    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 15,
      ResponseContentDisposition: `attachment; filename="${book.title}.pdf"`,
    });

    return res.json({ success: true, data: { url: signedUrl } }); // give you download link
    // return res.redirect(signedUrl); // redirect to PDF File
  } catch (err) {
    next(err);
  }
};
