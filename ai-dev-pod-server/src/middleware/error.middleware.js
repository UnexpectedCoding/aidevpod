import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorMiddleware;