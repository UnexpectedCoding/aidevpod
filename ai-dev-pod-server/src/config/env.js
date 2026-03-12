import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const MODEL_NAME = process.env.MODEL_NAME || "llama3";