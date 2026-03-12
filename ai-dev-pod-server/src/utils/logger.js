import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
    logToFile("info", message);
  },
  warn: (message) => {
    console.warn(`[WARN] ${message}`);
    logToFile("warn", message);
  },
  error: (message) => {
    console.error(`[ERROR] ${message}`);
    logToFile("error", message);
  },
};

const logToFile = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  const logFile = path.join(logsDir, "app.log");

  fs.appendFileSync(logFile, logMessage);
};

export default logger;