/**
 * Gemini API utility functions
 * Centralized API calls for chat and file processing
 * With automatic fallback to alternative models
 * 
 * TEMPLATE: Create a .env.local file in the root with:
 * VITE_GOOGLE_API_KEY={{YOUR_GOOGLE_GENERATIVE_AI_API_KEY}}
 */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// ─── Available model profiles ───────────────────────────────
// "fast"  → lightweight, low-latency models tried first
// "auto"  → picks heavier models for complex prompts, lighter for simple ones
// default → balanced fallback chain

const MODELS_FAST = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash",
];

const MODELS_FULL = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
];

const MODELS_DEFAULT = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash-001",
  "gemini-1.5-pro",
];

/** Exposed for the UI to list available model names */
export const AVAILABLE_MODELS = {
  fast: MODELS_FAST,
  full: MODELS_FULL,
  default: MODELS_DEFAULT,
};

/**
 * Simple heuristic: is the prompt "complex"?
 * Used by auto mode to decide fast vs full.
 */
function isComplexPrompt(text) {
  if (!text) return false;
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount > 80) return true;
  const complexKeywords = /\b(explain|analyze|compare|summarize|essay|detail|in-?depth|research|step.by.step|write me)\b/i;
  return complexKeywords.test(text);
}

/**
 * Return the model list for a given mode + prompt.
 * @param {"fast"|"auto"|"default"} mode
 * @param {string} [prompt]  used by "auto" to decide
 */
export function getModelsForMode(mode, prompt) {
  if (mode === "fast") return MODELS_FAST;
  if (mode === "auto") {
    return isComplexPrompt(prompt) ? MODELS_FULL : MODELS_FAST;
  }
  return MODELS_DEFAULT;
}

let currentModel = MODELS_DEFAULT[0]; // Track which model is working

/**
 * Build URL for a given model
 */
const getURL = (model) => 
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

/**
 * Check if error is model-not-found/unavailable (should trigger fallback)
 */
const isModelError = (errMsg) => {
  return errMsg.includes("not found") || 
         errMsg.includes("not available") || 
         errMsg.includes("is not supported") ||
         errMsg.includes("no longer available");
};

/**
 * Call Gemini API with fallback models
 * @param {object} payload
 * @param {number} retryCount
 * @param {string[]} [models] - ordered list of models to try
 */
const callGeminiAPI = async (payload, retryCount = 0, models = MODELS_DEFAULT) => {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const modelToTry = models[retryCount] || currentModel;
  const url = getURL(modelToTry);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      const errMsg = errData.error?.message || "API request failed";

      // If model not available, try next one
      if (isModelError(errMsg) && retryCount < models.length - 1) {
        console.warn(`Model ${modelToTry} unavailable, trying ${models[retryCount + 1]}...`);
        return callGeminiAPI(payload, retryCount + 1, models);
      }

      // Handle quota exceeded
      if (errMsg.includes("Quota exceeded")) {
        const error = new Error(errMsg);
        error.isQuotaExceeded = true;
        throw error;
      }

      throw new Error(errMsg);
    }

    // Update current model if different
    if (modelToTry !== currentModel) {
      currentModel = modelToTry;
      console.log(`Gemini API using model: ${modelToTry}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    // If model error and more fallbacks available, retry
    if (isModelError(err.message) && retryCount < models.length - 1) {
      console.warn(`Model ${modelToTry} failed, trying ${models[retryCount + 1]}...`);
      return callGeminiAPI(payload, retryCount + 1, models);
    }
    throw err;
  }
};

/**
 * Call Gemini API with message history (for chat)
 * @param {Array} messages - conversation history
 * @param {string} userMessage
 * @param {object} [config]
 * @param {string} [config.mode] - "fast" | "auto" | "default"
 * @param {Array}  [config.fileParts] - inline file parts [{inline_data:{mime_type,data}}]
 */
export async function callGeminiChat(messages, userMessage, config = {}) {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const mode = config.mode || "default";
  const models = getModelsForMode(mode, userMessage);

  // Build conversation history for Gemini
  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: msg.parts || [{ text: msg.text }],
  }));

  // Build current user message parts
  const userParts = [{ text: userMessage }];
  if (config.fileParts && config.fileParts.length > 0) {
    userParts.push(...config.fileParts);
  }

  contents.push({
    role: "user",
    parts: userParts,
  });

  const isFast = mode === "fast";
  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: config.maxOutputTokens || (isFast ? 600 : 1000),
      temperature: config.temperature ?? (isFast ? 0.5 : 0.8),
    },
  };

  return callGeminiAPI(payload, 0, models);
}

/**
 * Call Gemini API with files and system prompt (for planner)
 */
export async function callGeminiWithFiles(userContent, fileParts, systemPrompt, config = {}) {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const messageParts = [{ text: userContent }, ...fileParts];

  const payload = {
    contents: [{
      role: "user",
      parts: messageParts
    }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      maxOutputTokens: config.maxOutputTokens || 4000,
      temperature: config.temperature || 0.7
    }
  };

  console.log("Calling Gemini API...", { userContent: userContent.substring(0, 100) });

  return callGeminiAPI(payload);
}
