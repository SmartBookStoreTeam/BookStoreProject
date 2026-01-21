import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import previewRoutes from "./routes/previewRoutes.js";

dotenv.config();
connectDB();

const app = express();

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
  "http://localhost:5174", // ممكن تستخدمه كمان
  "http://192.168.1.19:5173", // dev frontend
  // ضع هنا دومين الـ production بعد الرفع
  "https://d1r1pvso22xiyd.cloudfront.net",
  "http://d1r1pvso22xiyd.cloudfront.net"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // السماح بالطلبات من same origin أو Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api", downloadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api", previewRoutes);

const PORT = process.env.PORT || 5000;

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
