/**
 * App Configuration System
 * 
 * Developers/business owners can customize the app by editing this file.
 * All UI structure, branding, and behavior is driven from here.
 */

import { Home, CalendarDays, Settings, Inbox, BookOpen, BarChart3, Users, MessageSquare, FileText, Search, LayoutGrid, Zap } from 'lucide-react';

// ─── Branding ───────────────────────────────────────────────
export const APP_CONFIG = {
  name: "Rumpel",
  tagline: "AI-Powered Customer Support",
  version: "3.0.0",
  fabPlaceholder: "Ask Rumpel…",
  fabIcon: null, // null = use default rumpel icon
};

// ─── Navigation Tabs ────────────────────────────────────────
// Add, remove, or reorder tabs here. Each tab needs:
//   id:    unique key (must match a screen in App.jsx)
//   Icon:  a lucide-react icon component
//   label: optional label shown below the icon (if your CSS supports it)
export const NAV_TABS = [
  { id: "home",     Icon: Home,         label: "Home" },
  { id: "tickets",  Icon: Inbox,        label: "Tickets" },
  { id: "calendar", Icon: CalendarDays, label: "Calendar" },
  { id: "settings", Icon: Settings,     label: "Settings" },
];

// ─── FAB (Floating Action Button) ───────────────────────────
// Controls FAB bar visibility and behavior.
export const FAB_CONFIG = {
  show: true,           // set false to hide the FAB entirely
  showQuickInput: true, // show the inline text input next to the FAB
  quickInputPlaceholder: "Ask Rumpel…",
  quickReplies: [
    "Got it! I'll look into that.",
    "Let me check on that for you.",
    "Noted! Following up now.",
    "I've logged that — anything else?",
  ],
};

// ─── Chat Suggestions ───────────────────────────────────────
// Shown when the chat modal opens with no messages.
export const CHAT_SUGGESTIONS = [
  { icon: FileText,   label: "Draft a Response",      prompt: "Help me draft a customer support response. Ask what the customer's issue is and what tone I should use." },
  { icon: Search,     label: "Search Knowledge Base",  prompt: "Help me find relevant information from our knowledge base. Ask what topic or issue I need help with." },
  { icon: LayoutGrid, label: "Ticket Overview",        prompt: "Give me a summary of the current ticket and suggest next steps." },
  { icon: FileText,   label: "Summarize Conversation", prompt: "Summarize this customer interaction into key points and action items." },
  { icon: Search,     label: "Troubleshoot Issue",     prompt: "Help me troubleshoot a customer's technical issue. Ask what the problem is and what they've already tried." },
];

// ─── Ticket Tags / Categories ───────────────────────────────
// Used both in ticket creation and by the AI for categorization.
export const TICKET_TAGS = ["Billing", "Technical", "General", "Feedback", "Other"];

// Tag colors for the UI
export const TAG_COLORS = {
  Billing:   "#4CAF50",
  Technical: "#2196F3",
  General:   "#9E9E9E",
  Feedback:  "#FF9800",
  Other:     "#607D8B",
};

// ─── Ticket Priorities ──────────────────────────────────────
export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"];

export const PRIORITY_COLORS = {
  low:    "#9E9E9E",
  medium: "#FF9800",
  high:   "#F44336",
  urgent: "#D32F2F",
};
