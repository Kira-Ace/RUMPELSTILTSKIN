import { Home, CalendarDays, Settings } from "lucide-react";

/**
 * Navigation tab definitions.
 * Each entry needs an `id` (matches the tab key in App.jsx) and an `Icon` component.
 */
export const NAV_TABS = [
  { id: "home", Icon: Home },
  { id: "calendar", Icon: CalendarDays },
  { id: "settings", Icon: Settings },
];

/**
 * Floating Action Button configuration.
 */
export const FAB_CONFIG = {
  show: true,
  showQuickInput: true,
  quickInputPlaceholder: "Ask Rumpel…",
  quickReplies: [
    "Got it! Added to your schedule.",
    "Great idea! Reminder set?",
    "Done! You've got this! 🎯",
    "Added to your list.",
  ],
};
