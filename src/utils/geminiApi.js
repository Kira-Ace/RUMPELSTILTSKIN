/**
 * Chat API utilities.
 * The backend owns Gemini-specific request shaping and model selection.
 */

import { CHAT_SYSTEM_PROMPT } from './constants.js';

const API_PROXY = (import.meta.env.VITE_API_PROXY || 'http://localhost:3001').replace(/\/$/, '');

function normalizeMode(mode) {
  return mode === 'fast' || mode === 'auto' ? mode : 'default';
}

function normalizeSystemPrompt(systemPrompt) {
  if (typeof systemPrompt !== 'string') {
    return CHAT_SYSTEM_PROMPT;
  }

  const trimmed = systemPrompt.trim();
  return trimmed || CHAT_SYSTEM_PROMPT;
}

function normalizeAttachments(attachments = []) {
  return attachments.flatMap((attachment) => {
    if (!attachment || typeof attachment.mime !== 'string' || typeof attachment.data !== 'string') {
      return [];
    }

    return [{
      name: attachment.name,
      mime: attachment.mime,
      data: attachment.data,
    }];
  });
}

function normalizeMessages(messages = []) {
  return messages.flatMap((message) => {
    if (!message || (message.role !== 'assistant' && message.role !== 'user')) {
      return [];
    }

    return [{
      role: message.role,
      text: typeof message.text === 'string' ? message.text : '',
      attachments: normalizeAttachments(message.attachments),
    }];
  });
}

async function callChatApi(payload) {
  let res;

  try {
    res = await fetch(`${API_PROXY}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    const err = new Error('Backend proxy is not running. Start it: cd server && npm run dev');
    err.isNetworkError = true;
    throw err;
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.error || `HTTP ${res.status}`);
    throw err;
  }

  const data = await res.json();
  return data.text;
}

/**
 * Call the app chat API with message history.
 * @param {Array} messages - conversation history
 * @param {string} userMessage
 * @param {object} [config]
 * @param {string} [config.mode] - "fast" | "auto" | "default"
 * @param {Array} [config.attachments] - file attachments [{name,mime,data}]
 * @param {string} [config.purpose] - "chat" | "title"
 * @param {string} [config.systemPrompt] - optional system prompt override
 */
export async function callGeminiChat(messages, userMessage, config = {}) {
  const purpose = config.purpose === 'title' ? 'title' : 'chat';

  return callChatApi({
    messages: normalizeMessages(messages),
    userMessage: typeof userMessage === 'string' ? userMessage : '',
    attachments: normalizeAttachments(config.attachments),
    mode: normalizeMode(config.mode),
    purpose,
    systemPrompt: purpose === 'chat' ? normalizeSystemPrompt(config.systemPrompt) : '',
  });
}
