import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import cartRoutes from "./routes/cartRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import bookRequestRoutes from "./routes/bookRequestRoutes.js";
import adminBookRequestRoutes from "./routes/adminBookRequestRoutes.js";
import authorApplicationRoutes from "./routes/authorApplicationRoutes.js";
import adminAuthorApplicationRoutes from "./routes/adminAuthorApplicationRoutes.js";
import authorDashboardRoutes from "./routes/authorDashboardRoutes.js";
import authorBookRoutes from "./routes/authorBookRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ⚠️ MUST be before express.json() — Stripe needs the raw body to verify webhook signature
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// General body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
  }),
);

// Health check
app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.status(200).send("ok"));

// Swagger
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
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/admin/book-requests", adminBookRequestRoutes);
app.use("/api/author-applications", authorApplicationRoutes);
app.use("/api/admin/author-applications", adminAuthorApplicationRoutes);
app.use("/api/author/dashboard", authorDashboardRoutes);
app.use("/api/author", authorBookRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/tracking", trackingRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
