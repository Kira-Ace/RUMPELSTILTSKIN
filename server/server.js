import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

[
  path.resolve(__dirname, '.env.local'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env.local'),
].forEach((envPath) => {
  dotenv.config({ path: envPath, override: false });
});

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const AVAILABLE_MODELS_LIST = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-pro-preview-customtools',
  'gemini-3.1-flash-lite-preview',
  'gemma-3-1b-it',
  'gemma-3-4b-it',
  'gemma-3-12b-it',
  'gemma-3-27b-it',
  'gemma-3n-e4b-it',
  'gemma-3n-e2b-it',
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
  'nano-banana-pro-preview',
  'lyria-3-clip-preview',
  'lyria-3-pro-preview',
  'gemini-robotics-er-1.5-preview',
  'gemini-2.5-computer-use-preview-10-2025',
  'deep-research-pro-preview-12-2025',
];

const MODELS_FAST = AVAILABLE_MODELS_LIST.slice(0, 3);
const MODELS_FULL = ['gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.5-flash'];
const VALID_MODES = new Set(['fast', 'auto', 'default']);
const VALID_PURPOSES = new Set(['chat', 'title']);

function isComplexPrompt(text) {
  if (!text) return false;

  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount > 80) return true;

  return /\b(explain|analyze|compare|summarize|essay|detail|in-?depth|research|step.by.step|write me)\b/i.test(text);
}

function normalizeMode(mode) {
  return VALID_MODES.has(mode) ? mode : 'default';
}

function normalizePurpose(purpose) {
  return VALID_PURPOSES.has(purpose) ? purpose : 'chat';
}

function normalizeSystemPrompt(systemPrompt) {
  return typeof systemPrompt === 'string' ? systemPrompt.trim() : '';
}

function getAttachmentParts(attachments = []) {
  return attachments.flatMap((attachment) => {
    if (!attachment || typeof attachment.mime !== 'string' || typeof attachment.data !== 'string') {
      return [];
    }

    return [{
      inline_data: {
        mime_type: attachment.mime,
        data: attachment.data,
      },
    }];
  });
}

function getMessageParts(message = {}) {
  const parts = [];
  const text = typeof message.text === 'string' ? message.text.trim() : '';

  if (text) {
    parts.push({ text });
  }

  if (message.role !== 'assistant') {
    parts.push(...getAttachmentParts(message.attachments));
  }

  return parts;
}

function buildContents(messages = [], userMessage, attachments = []) {
  const history = messages.flatMap((message) => {
    const parts = getMessageParts(message);

    if (!parts.length) {
      return [];
    }

    return [{
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    }];
  });

  const nextParts = [];
  const text = typeof userMessage === 'string' ? userMessage.trim() : '';
  const attachmentParts = getAttachmentParts(attachments);

  if (text) {
    nextParts.push({ text });
  } else if (attachmentParts.length > 0) {
    nextParts.push({ text: 'Describe the attached file(s).' });
  }

  nextParts.push(...attachmentParts);

  if (!nextParts.length) {
    return history;
  }

  return [...history, { role: 'user', parts: nextParts }];
}

function getModelsForMode(mode, prompt, purpose) {
  if (purpose === 'title') {
    return MODELS_FAST;
  }

  if (mode === 'fast') {
    return MODELS_FAST;
  }

  if (mode === 'auto') {
    return isComplexPrompt(prompt) ? MODELS_FULL : MODELS_FAST;
  }

  return AVAILABLE_MODELS_LIST;
}

function getGenerationConfig(mode, prompt, purpose) {
  if (purpose === 'title') {
    return {
      maxOutputTokens: 20,
      temperature: 0.3,
    };
  }

  const useFastProfile = mode === 'fast' || (mode === 'auto' && !isComplexPrompt(prompt));

  return {
    maxOutputTokens: useFastProfile ? 600 : 1000,
    temperature: useFastProfile ? 0.5 : 0.8,
  };
}

async function callGeminiModel(model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json();

  if (!response.ok) {
    const message = data.error?.message || 'API Error';
    const error = new Error(message);
    error.status = response.status;
    error.isModelError = response.status === 404 || message.toLowerCase().includes('not found');
    throw error;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const error = new Error('No text in response');
    error.status = 500;
    throw error;
  }

  return { text, model };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiWithFallback(payload, models) {
  let lastError = null;

  for (const model of models) {
    try {
      return await callGeminiModel(model, payload);
    } catch (error) {
      lastError = error;

      if (!error.isModelError) {
        throw error;
      }

      console.warn(`Model ${model} failed: ${error.message}`);
    }
  }

  throw lastError || new Error('All configured models failed');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * POST /api/chat
 * Server-owned chat endpoint.
 * Body: { messages, userMessage, attachments, mode, purpose, systemPrompt }
 */
app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const {
    messages = [],
    userMessage = '',
    attachments = [],
    mode = 'default',
    purpose = 'chat',
    systemPrompt = '',
  } = req.body || {};

  if (!Array.isArray(messages) || !Array.isArray(attachments)) {
    return res.status(400).json({ error: 'Messages and attachments must be arrays' });
  }

  if (typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'User message must be a string' });
  }

  if (typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: 'System prompt must be a string' });
  }

  if (!userMessage.trim() && attachments.length === 0) {
    return res.status(400).json({ error: 'Missing user message or attachments' });
  }

  try {
    const normalizedMode = normalizeMode(mode);
    const normalizedPurpose = normalizePurpose(purpose);
    const normalizedSystemPrompt = normalizeSystemPrompt(systemPrompt);
    const contents = buildContents(messages, userMessage, attachments);

    if (!contents.length) {
      return res.status(400).json({ error: 'No valid chat content was provided' });
    }

    const models = getModelsForMode(normalizedMode, userMessage, normalizedPurpose);
    const generationConfig = getGenerationConfig(normalizedMode, userMessage, normalizedPurpose);
    const payload = { contents, generationConfig };

    if (normalizedPurpose === 'chat' && normalizedSystemPrompt) {
      payload.systemInstruction = { parts: [{ text: normalizedSystemPrompt }] };
    }

    const result = await callGeminiWithFallback(payload, models);

    res.json(result);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Chat request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Rumpel API Proxy running on http://localhost:${PORT}`);
  console.log(`  Chat endpoint: POST /api/chat`);
});
