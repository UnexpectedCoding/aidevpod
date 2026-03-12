import { MODEL_NAME } from "./env.js";

/**
 * Central model configuration
 * This keeps all model-related parameters in one place
 * So we can easily change model or tuning later
 */

export const MODEL_CONFIG = {
  name: MODEL_NAME,
  baseOptions: {
    stream: false,
  },
};

/**
 * Agent-specific model settings
 * Each agent gets its own temperature and limits
 */

export const AGENT_MODEL_SETTINGS = {
  pm: {
    temperature: 0.3,
    max_tokens: 1500,
  },
  dev: {
    temperature: 0.4,
    max_tokens: 2500,
  },
  qa: {
    temperature: 0.2,
    max_tokens: 1500,
  },
  evaluator: {
    temperature: 0.2,
    max_tokens: 1000,
  },
};