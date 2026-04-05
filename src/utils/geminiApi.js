/**
 * Gemini API utility functions
 * Centralized API calls for chat and file processing
 * With automatic fallback to alternative models
 * 
 * TEMPLATE: Create a .env.local file in the root with:
 * VITE_GOOGLE_API_KEY={{YOUR_GOOGLE_GENERATIVE_AI_API_KEY}}
 */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Model priority list (will try in order if previous fails)
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash-001",
  "gemini-1.5-pro"
];

let currentModel = MODELS[0]; // Track which model is working

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
 */
const callGeminiAPI = async (payload, retryCount = 0) => {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const modelToTry = MODELS[retryCount] || currentModel;
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
      if (isModelError(errMsg) && retryCount < MODELS.length - 1) {
        console.warn(`Model ${modelToTry} unavailable, trying ${MODELS[retryCount + 1]}...`);
        return callGeminiAPI(payload, retryCount + 1);
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
    if (isModelError(err.message) && retryCount < MODELS.length - 1) {
      console.warn(`Model ${modelToTry} failed, trying ${MODELS[retryCount + 1]}...`);
      return callGeminiAPI(payload, retryCount + 1);
    }
    throw err;
  }
};

/**
 * Call Gemini API with message history (for chat)
 */
export async function callGeminiChat(messages, userMessage, config = {}) {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  // Build conversation history for Gemini
  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: config.maxOutputTokens || 1000,
      temperature: config.temperature || 0.8,
    },
  };

  return callGeminiAPI(payload);
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
