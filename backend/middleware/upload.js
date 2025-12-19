import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // الملفات هتكون في الذاكرة مؤقتاً
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(req, file, cb) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF files allowed"), false);
    }
  },
});

export const uploadBookFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);
