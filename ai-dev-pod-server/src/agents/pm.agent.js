// src/agents/pm.agent.js

import { callOllama } from "../services/ollama.service.js";
import { AGENT_MODEL_SETTINGS } from "../config/model.config.js";
import { buildPMPrompt } from "../prompts/pm.prompt.js";
import { safeJSONParse } from "../utils/jsonParser.js";

export const runPMAgent = async (userPrompt) => {
  try {
    const prompt = buildPMPrompt(userPrompt);

    const response = await callOllama({
      prompt,
      temperature: AGENT_MODEL_SETTINGS.pm.temperature,
      max_tokens: AGENT_MODEL_SETTINGS.pm.max_tokens,
    });

    const parsed = safeJSONParse(response);

    return parsed;
  } catch (error) {
    throw new Error(`PM Agent Failed: ${error.message}`);
  }
};