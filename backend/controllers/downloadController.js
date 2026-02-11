import AWS from "aws-sdk";
import Book from "../models/Book.js";
import LibraryItem from "../models/LibraryItem.js";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

function extractS3Key(pdfValue = "") {
  if (!pdfValue) return "";
  if (!pdfValue.startsWith("http")) return pdfValue;

  const marker = ".amazonaws.com/";
  const idx = pdfValue.indexOf(marker);
  if (idx === -1) return pdfValue;

  return pdfValue.slice(idx + marker.length);
}

export const downloadBook = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const bookId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // هات الكتاب مع full+preview (select:false)
    const book = await Book.findById(bookId).select("+pdf +previewPdf title");
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Admin full access
    let hasFullAccess = req.user.role === "admin";

    if (!hasFullAccess) {
      const owned = await LibraryItem.findOne({
        user: userId,
        book: bookId,
        accessStatus: "active",
      })
        .select("_id")
        .lean();

      hasFullAccess = !!owned;
    }

    // اختار الملف حسب صلاحية المستخدم
    const fileKey = hasFullAccess ? extractS3Key(book.pdf) : extractS3Key(book.previewPdf);

    if (!fileKey) {
      return res.status(404).json({
        success: false,
        message: hasFullAccess ? "Book PDF key is missing" : "Preview PDF key is missing",
      });
    }

    const filename = hasFullAccess ? `${book.title}.pdf` : `${book.title}-preview.pdf`;

    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 60 * 15,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    return res.json({
      success: true,
      data: { url: signedUrl, type: hasFullAccess ? "full" : "preview" },
    });
  } catch (err) {
    next(err);
  }
};
