# ⚡ Quick Reference - Customization Cheat Sheet

## Find & Replace Placeholders

Use your editor's find-and-replace (Cmd+Shift+H / Ctrl+Shift+H) to quick-swap these:

| Placeholder | Replace With | File(s) |
|-------------|--------------|---------|
| `{{APP_NAME}}` | Your app name | HomeScreen, TopBar |
| `{{USER_NAME}}` | Your name | SettingsScreen |
| `{{USER_ROLE}}` | Your title | SettingsScreen |
| `{{USER_LEVEL}}` | Achievement/level | SettingsScreen |
| `{{USER_BIO}}` | Your bio | SettingsScreen |
| `{{PROGRESS_PCT}}` | 0-100 | HomeScreen |
| `{{STREAK_COUNT}}` | Number | HomeScreen |
| `{{QUOTE_TEXT}}` | Motivational quote | HomeScreen |
| `{{QUOTE_AUTHOR}}` | Author name | HomeScreen |
| `{{VITE_GOOGLE_API_KEY}}` | Your API key | .env.local |

---

## 5-Minute Setup

```bash
# 1. Install
npm install

# 2. Create .env.local with your API key
echo 'VITE_GOOGLE_API_KEY=YOUR_KEY_HERE' > .env.local

# 3. Replace placeholders in code
# Search for {{PLACEHOLDER}} and replace

# 4. Run
npm run dev
```

---

## Key Files to Edit

### Must Edit (App won't work without these)
- ✅ `.env.local` - Add Google API key

### Should Edit (Recommended)
- ✅ `src/utils/constants.js` - App name
- ✅ `src/components/screens/SettingsScreen.jsx` - User profile
- ✅ `src/components/common/Greeting.jsx` - Add greetings

### Nice to Edit (Polish)
- `src/components/screens/HomeScreen.jsx` - Stats & quotes
- `src/components/assets/rumpel.png` - Logo
- `src/styles/global.css` - Colors

---

## File Structure at a Glance

```
screens/
├── SplashScreen.jsx    ← Splash on load (no edits needed)
├── HomeScreen.jsx      ← {{PROGRESS_PCT}}, {{STREAK_COUNT}}, {{QUOTE_TEXT}}
├── CalendarScreen.jsx  ← Task manager (no placeholders)
└── SettingsScreen.jsx  ← {{USER_NAME}}, {{USER_ROLE}}, {{USER_BIO}}

common/
├── TopBar.jsx          ← Logo location
├── BottomNav.jsx       ← Navigation (no edits needed)
├── ChatModal.jsx       ← AI chat (customize system prompt)
├── Greeting.jsx        ← Add greeting messages
└── FocusTimer.jsx      ← Timer modal (no edits needed)

utils/
├── constants.js        ← {{APP_NAME}}, initialTasks
├── dateUtils.js        ← Date helpers (no edits needed)
└── geminiApi.js        ← AI integration (customize personality)
```

---

## Common Customizations

### Add More Greetings
**File:** `src/components/common/Greeting.jsx`
```javascript
const GREETINGS = [
  "What's kirking,",
  "Ready to learn,",
  "Time to grow,",
  "Let's ship,",        // ADD HERE
  "Today's the day,",   // ADD HERE
];
```

### Add Initial Tasks
**File:** `src/utils/constants.js`
```javascript
export const initialTasks = {
  "2026-04-02": [
    {
      id: 1,
      title: "My First Task",
      time: "09:00",
      desc: "Task description",
      tag: "Work"
    }
  ]
};
```

### Update Date (if needed)
**File:** `src/utils/constants.js`
```javascript
export const TODAY  = { y:2026, m:3, d:1 }; // Change month (0-indexed), day, year
```

### Customize AI Personality
**File:** `src/utils/geminiApi.js`
```javascript
// Find callGeminiChat function and modify system prompt
const systemPrompt = "You are a helpful study assistant...";
```

---

## Testing Checklist

- [ ] `npm run dev` starts without errors
- [ ] Google API key is in `.env.local`
- [ ] Chat modal opens and AI responds
- [ ] Calendar tasks can be created/edited
- [ ] All placeholders replaced with real data
- [ ] App name appears in greeting
- [ ] User profile shows custom name/role
- [ ] Stats display correctly

---

## Build & Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank chat | Check API key in `.env.local` |
| App crashes | Look for unreplaced `{{PLACEHOLDERS}}` |
| Styling broken | Check CSS imports in component files |
| Tasks not showing | Verify `initialTasks` in `constants.js` |
| Date wrong | Update `TODAY` in `constants.js` |

---

## Placeholder Search Guide

Use your editor to find all areas to customize:

**Find any of these:**
- `{{` - All placeholders
- `TEMPLATE:` - All customization points  
- `hardcoded` - Hard-coded values that should be dynamic

**Example (VS Code):**
```
Cmd+Shift+F → Search for "{{" → Replace all
```

---

## File Sizes

| Feature | Lines | File |
|---------|-------|------|
| **App Main** | 40 | App.jsx |
| **Navigation** | 45 | BottomNav.jsx |
| **Home** | 75 | HomeScreen.jsx |
| **Calendar** | 200+ | CalendarScreen.jsx |
| **Settings** | 60 | SettingsScreen.jsx |
| **AI Chat** | 80 | ChatModal.jsx |

**Total Production Code:** ~500 lines (very lean!)

---

## Pro Tips

1. **Batch Replace:** Use find-all to replace all `{{PLACEHOLDER}}` at once
2. **Sample Data:** Add 3-5 sample tasks to `initialTasks` for clean demo
3. **API Testing:** Test chat modal before final submission
4. **Mobile Test:** Use browser DevTools' mobile view (375×812px)
5. **Version:** Update version number in `SettingsScreen` before final build

---

## Next Steps

1. ✅ Setup (npm install + .env.local)
2. ✅ Customize (Replace placeholders)
3. ✅ Test (npm run dev)
4. ✅ Build (npm run build)
5. ✅ Deploy (Your hosting)

**Estimated time: 10-15 minutes** ⚡

---

**Need more details?** See [TEMPLATE.md](./TEMPLATE.md) for comprehensive guide.

