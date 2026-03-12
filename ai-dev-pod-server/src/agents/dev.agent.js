// src/agents/dev.agent.js

import { callOllama } from "../services/ollama.service.js";
import { AGENT_MODEL_SETTINGS } from "../config/model.config.js";
import { buildDevPrompt } from "../prompts/dev.prompt.js";
import { safeJSONParse } from "../utils/jsonParser.js";

export const runDevAgent = async (pmOutput) => {
  try {
    if (!pmOutput) {
      throw new Error("PM output is required for Dev Agent.");
    }

    const prompt = buildDevPrompt(pmOutput);

    const response = await callOllama({
      prompt,
      temperature: AGENT_MODEL_SETTINGS.dev.temperature,
      max_tokens: AGENT_MODEL_SETTINGS.dev.max_tokens,
    });

    const parsed = safeJSONParse(response);

    return parsed;
  } catch (error) {
    throw new Error(`Dev Agent Failed: ${error.message}`);
  }
};