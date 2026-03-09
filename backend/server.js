import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { stripeWebhook } from "./controllers/paymentController.js";

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
import cartRoutes from "./routes/cartRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// JSON parser
app.use(
  express.json({
    verify: (req, res, buf) => {
      // خزّن raw body فقط للـ webhook
      if (req.originalUrl === "/api/payments/webhook") {
        req.rawBody = buf;
      }
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

app.post("/api/payments/webhook", stripeWebhook);

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://192.168.1.19:5173",
  "https://d1r1pvso22xiyd.cloudfront.net",
  "http://d1r1pvso22xiyd.cloudfront.net",
  "http://d3bwgf4wkm0gnh.cloudfront.net",
  "https://d3bwgf4wkm0gnh.cloudfront.net", // ✅ new CloudFront
];

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    //   function (origin, callback) {
    //   if (!origin) return callback(null, true);
    //   if (allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api", downloadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api", previewRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
