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

dotenv.config();
connectDB();

const app = express();

// JSON parser
app.use(express.json());

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
  "http://localhost:5174", // ممكن تستخدمه كمان
  // ضع هنا دومين الـ production بعد الرفع
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

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
