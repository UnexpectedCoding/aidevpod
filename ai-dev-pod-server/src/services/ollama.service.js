import logger from "../utils/logger.js";

export async function callOllama(model, prompt) {
  logger.info(`📞 Calling Ollama - Model: ${model}, Prompt length: ${prompt.length}`);

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false, // important: return single JSON object
    }),
  });

  logger.info(`✅ Ollama response received - Status: ${response.status}`);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data;
}