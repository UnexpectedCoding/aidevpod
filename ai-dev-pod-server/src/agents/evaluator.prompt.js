// src/agents/reviewer.agent.js

import { callOllama } from "../services/ollama.service.js";
import { AGENT_MODEL_SETTINGS } from "../config/model.config.js";
import { buildevaluatorPrompt } from "../prompts/reviewer.prompt.js";
import { safeJSONParse } from "../utils/jsonParser.js";

export const runEvaluatorAgent = async (qaOutput) => {
  try {
    if (!qaOutput) {
      throw new Error("QA output is required for Evaluator Agent.");
    }

    const prompt = buildevaluatorPrompt(qaOutput);

    const response = await callOllama({
      prompt,
      temperature: AGENT_MODEL_SETTINGS.evaluator.temperature,
      max_tokens: AGENT_MODEL_SETTINGS.evaluator.max_tokens,
    });

    const parsed = safeJSONParse(response);

    return parsed;
  } catch (error) {
    throw new Error(`Evaluator Agent Failed: ${error.message}`);
  }
};