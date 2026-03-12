import http from "http";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT.`);
    process.exit(1);
  }

  logger.error(`Server failed to start: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.warn("SIGINT received. Shutting down server...");
  server.close(() => {
    logger.info("Server closed gracefully.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.warn("SIGTERM received. Shutting down server...");
  server.close(() => {
    logger.info("Server closed gracefully.");
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});