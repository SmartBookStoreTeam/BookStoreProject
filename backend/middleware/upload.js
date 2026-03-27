import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // الملفات هتكون في الذاكرة مؤقتاً
  limits: { fileSize: 50 * 1024 * 1024 }, // 20MB
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
  { name: "previewPdf", maxCount: 1 },
]);


export const validateBookFiles = (req, res, next) => {
  const image = req.files?.image?.[0];
  const pdf = req.files?.pdf?.[0];

  if (!image || !pdf) {
    return res.status(400).json({
      success: false,
      error: "Image and PDF are required",
    });
  }

  if (!image.mimetype.startsWith("image/")) {
    return res.status(400).json({
      success: false,
      error: "Invalid image file",
    });
  }

  if (pdf.mimetype !== "application/pdf") {
    return res.status(400).json({
      success: false,
      error: "Invalid PDF file",
    });
  }

  next();
};
