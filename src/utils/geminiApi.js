/**
 * Gemini API utility functions
 * Calls backend proxy at /api/chat (keeps API key secure server-side)
 * 
 * Backend proxy reads VITE_GOOGLE_API_KEY from root .env.local
 */

const API_PROXY = import.meta.env.VITE_API_PROXY || 'http://localhost:3001';

// ─── All available models (hardcoded from API) ───────────────────────────────
const AVAILABLE_MODELS_LIST = [
  // Primary/latest (fastest)
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-pro-latest",
  
  // Fallbacks
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  
  // TTS variants
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
  
  // Image variants
  "gemini-2.5-flash-image",
  "gemini-3-pro-image-preview",
  "gemini-3.1-flash-image-preview",
  
  // Preview models
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "gemini-3.1-flash-lite-preview",
  
  // Gemma models (fallback)
  "gemma-3-1b-it",
  "gemma-3-4b-it",
  "gemma-3-12b-it",
  "gemma-3-27b-it",
  "gemma-3n-e4b-it",
  "gemma-3n-e2b-it",
  "gemma-4-26b-a4b-it",
  "gemma-4-31b-it",
  
  // Specialty models
  "gemini-3-pro-image-preview",
  "nano-banana-pro-preview",
  "lyria-3-clip-preview",
  "lyria-3-pro-preview",
  "gemini-robotics-er-1.5-preview",
  "gemini-2.5-computer-use-preview-10-2025",
  "deep-research-pro-preview-12-2025",
];

// For UI/exports
const MODELS_FAST = AVAILABLE_MODELS_LIST.slice(0, 5);
const MODELS_FULL = AVAILABLE_MODELS_LIST.slice(5, 7);
const MODELS_DEFAULT = AVAILABLE_MODELS_LIST;

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

let currentModel = MODELS_DEFAULT[0];

/**
 * Call the backend proxy API
 * @param {string} model - model name
 * @param {object} payload - { contents, generationConfig }
 */
const callProxyAPI = async (model, payload) => {
  let res;
  try {
    res = await fetch(`${API_PROXY}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, ...payload }),
    });
  } catch (networkErr) {
    // Network failure (proxy not running) — mark as non-retryable
    const err = new Error('Backend proxy is not running. Start it: cd server && npm run dev');
    err.isNetworkError = true;
    throw err;
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.error || `HTTP ${res.status}`);
    // 404/unavailable = retryable with next model
    err.isModelError = res.status === 404 || (errData.error || '').toLowerCase().includes('not found');
    throw err;
  }

  const data = await res.json();
  return data.text;
};

/**
 * Call Gemini API with fallback models (via proxy)
 * @param {object} payload
 * @param {number} retryCount
 * @param {string[]} [models] - ordered list of models to try
 */
const callGeminiAPI = async (payload, retryCount = 0, models = AVAILABLE_MODELS_LIST) => {
  // Ensure models is always a valid array
  if (!models || !Array.isArray(models)) {
    models = AVAILABLE_MODELS_LIST;
  }

  const modelToTry = models[retryCount] || currentModel;

  try {
    const text = await callProxyAPI(modelToTry, payload);

    if (modelToTry !== currentModel) {
      currentModel = modelToTry;
      console.log(`✓ Using: ${modelToTry}`);
    }

    return text;
  } catch (err) {
    // Network error — proxy is down, don't bother retrying other models
    if (err.isNetworkError) throw err;

    // Only retry if it's a model-specific error (404, not found, etc.)
    if (err.isModelError && retryCount < models.length - 1) {
      const nextModel = models[retryCount + 1];
      console.warn(`✗ ${modelToTry} failed → trying ${nextModel}`);
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
  const mode = config.mode || "default";

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

  return callGeminiAPI(payload, 0, AVAILABLE_MODELS_LIST);
}

/**
 * Call Gemini API with files and system prompt (for planner)
 */
export async function callGeminiWithFiles(userContent, fileParts, systemPrompt, config = {}) {
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

  return callGeminiAPI(payload, 0, AVAILABLE_MODELS_LIST);
}
