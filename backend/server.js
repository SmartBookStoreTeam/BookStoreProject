import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

// import Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config(); // Load .env file
connectDB(); // Connect to MongoDB

const app = express();

app.use(express.json()); // Parse JSON request body
app.use(cors()); // Allow frontend access

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/books", bookRoutes); // Book routes
app.use("/api/admin", adminRoutes); // Admin routes

app.use(notFound); // 404 handler
app.use(errorHandler); // error handler

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
