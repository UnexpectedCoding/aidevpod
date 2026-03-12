// src/agents/qa.agent.js

import { callOllama } from "../services/ollama.service.js";
import { MODEL_CONFIG } from "../config/model.config.js";
import { buildQAPrompt } from "../prompts/qa.promp.js";

const formatSection = (title, items = []) => {
  const safeItems = Array.isArray(items) ? items : [items];
  const normalized = safeItems
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter(Boolean)
    .map((item) => `- ${item}`);

  return `${title}:\n${normalized.length ? normalized.join("\n") : "- None"}`;
};

const toStructuredQaText = (data) => {
  if (!data || typeof data !== "object") return "";

  const verdict = data.is_valid ? "Valid" : "Not Valid";
  const verdictReason = data.verdict_reason || data.reason || "Evaluation completed.";
  const risk = data.risk_level || "Unknown";

  const sections = [
    formatSection("Overall Verdict", `${verdict}: ${verdictReason}`),
    formatSection("Issues Found", data.issues_found),
    formatSection("Missing Elements", data.missing_elements),
    formatSection("Improvement Suggestions", data.improvement_suggestions),
    formatSection("Risk Level", `${risk}: Risk assessed by QA analysis.`),
  ];

  return sections.join("\n\n");
};

const parseJsonCandidate = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) return null;

  // First pass: parse as-is when model already returns valid JSON text.
  try {
    return JSON.parse(text);
  } catch {
    // Continue to tolerant parsing.
  }

  // Remove common wrappers like markdown fences and outer quotes.
  const cleaned = text
    .replace(/^```[a-zA-Z]*\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^"([\s\S]*)"$/, "$1")
    .replace(/^'([\s\S]*)'$/, "$1")
    .trim();

  // Second pass: parse cleaned candidate.
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to extraction heuristics.
  }

  // Third pass: extract the first JSON object-like block from mixed text.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
};

const parseAndFormatQAOutput = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) return "";

  // If model responds with JSON (including fenced or wrapped JSON), convert to readable sections.
  const parsedJson = parseJsonCandidate(text);
  if (parsedJson && typeof parsedJson === "object") {
    const structuredText = toStructuredQaText(parsedJson);
    if (structuredText) return structuredText;
  }

  // Clean accidental wrapping quotes and remove markdown code fences.
  const cleaned = text
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/\n?```$/, "")
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "")
    .trim();

  return cleaned;
};

export const runQAAgent = async (devOutput) => {
  try {
    if (!devOutput) {
      throw new Error("Dev output is required for QA Agent.");
    }

    const prompt = buildQAPrompt(devOutput);

    const response = await callOllama(MODEL_CONFIG.name, prompt);
    const qaText = typeof response?.response === "string" ? response.response.trim() : "";

    if (!qaText) {
      throw new Error("QA response is empty.");
    }

    const formattedQaText = parseAndFormatQAOutput(qaText);
    if (!formattedQaText) {
      throw new Error("QA response could not be formatted.");
    }

    return formattedQaText;
  } catch (error) {
    throw new Error(`QA Agent Failed: ${error.message}`);
  }
};