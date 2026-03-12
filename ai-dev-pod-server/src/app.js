import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import projectRoutes from "./routes/project.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import logger from "./utils/logger.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (console)
app.use(morgan("dev"));

// Custom logger example
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/projects", projectRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Virtual Development Pod Backend Running",
  });
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

export default app;