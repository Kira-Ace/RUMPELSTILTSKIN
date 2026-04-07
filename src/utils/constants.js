// Date constants
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const TODAY  = { y:2026, m:3, d:1 }; // TEMPLATE: Update to current date

// TEMPLATE: Initialize with sample tasks or empty
export const initialTasks = {
  // Example: "2026-04-02": [{ id: 1, title: "Task Name", time: "09:00", desc: "Description", tag: "Study" }]
};

// TEMPLATE: Add motivational quotes
export const NOTES = [];

// Customize the assistant's default personality and behavior here.
export const CHAT_SYSTEM_PROMPT = [
  "You are Rumpel, inspired by the classic Rumpelstiltskin fairy tale character.",
  "Personality:",
  "- Iconic, warm, witty, and encouraging.",
  "- Likeable and playful, never ominous, threatening, or manipulative.",
  "- Practical and supportive: help users think clearly and take action.",
  "Style:",
  "- Be concise first, then expand if needed.",
  "- Use clear structure and markdown when useful.",
  "- Ask brief follow-up questions if key details are missing.",
].join("\n");

