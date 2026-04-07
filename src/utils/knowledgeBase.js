/**
 * Knowledge Base Manager
 * 
 * Stores and retrieves knowledge base entries from localStorage.
 * Entries are injected into the Gemini system prompt as grounding context.
 * 
 * Each entry: { id, type: "text"|"faq"|"url", title, content, createdAt, updatedAt }
 */

const KB_STORAGE_KEY = 'rumpel_knowledge_base';
const KB_PROMPT_KEY = 'rumpel_business_prompt';

// ─── Storage ────────────────────────────────────────────────

export function getKnowledgeBase() {
  try {
    const raw = localStorage.getItem(KB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveKnowledgeBase(entries) {
  localStorage.setItem(KB_STORAGE_KEY, JSON.stringify(entries));
}

export function addKBEntry(entry) {
  const entries = getKnowledgeBase();
  const newEntry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type: entry.type || 'text',
    title: (entry.title || '').trim(),
    content: (entry.content || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  saveKnowledgeBase(entries);
  return newEntry;
}

export function updateKBEntry(id, updates) {
  const entries = getKnowledgeBase();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...updates, updatedAt: new Date().toISOString() };
  saveKnowledgeBase(entries);
  return entries[idx];
}

export function deleteKBEntry(id) {
  const entries = getKnowledgeBase().filter(e => e.id !== id);
  saveKnowledgeBase(entries);
}

// ─── Business Prompt ────────────────────────────────────────

export function getBusinessPrompt() {
  return localStorage.getItem(KB_PROMPT_KEY) || '';
}

export function saveBusinessPrompt(prompt) {
  localStorage.setItem(KB_PROMPT_KEY, (prompt || '').trim());
}

// ─── Context Builder ────────────────────────────────────────

/**
 * Builds a knowledge-base context string to inject into the system prompt.
 * Combines the custom business prompt + all KB entries.
 */
export function buildKBContext() {
  const businessPrompt = getBusinessPrompt();
  const entries = getKnowledgeBase();

  const lines = [];

  if (businessPrompt) {
    lines.push("Business context and instructions:");
    lines.push(businessPrompt);
    lines.push("");
  }

  if (entries.length === 0) {
    return lines.join("\n");
  }

  lines.push("Knowledge base entries (use these to answer customer questions):");
  lines.push("");

  entries.forEach((entry, i) => {
    const label = entry.type === 'faq' ? 'FAQ' : entry.type === 'url' ? 'Reference' : 'Document';
    lines.push(`[${label} ${i + 1}] ${entry.title}`);
    lines.push(entry.content);
    lines.push("");
  });

  return lines.join("\n");
}
