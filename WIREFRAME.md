# Rumpel App - Wireframe & Architecture

## 📱 Device Frame
```
┌─────────────────────────────┐
│      iOS Phone (375x812)    │
│                             │
│  [TOP BAR - Header]         │
│  - Logo (left)              │
│  - Avatar (right)           │
│                             │
│  [SCROLL CONTENT AREA]      │
│  - Screen content fills     │
│  - Scrollable region        │
│                             │
│  [BOTTOM NAV - Fixed]       │
│  - Home, Calendar, Settings │
│  - Rumpel FAB (chat)        │
│                             │
└─────────────────────────────┘
```

---

## 🗂️ Screen Architecture (Simplified - Hackathon MVP)

### **1. HOME SCREEN** ✅
```
┌─────────────────────────────┐
│ [TopBar]                    │
├─────────────────────────────┤
│ Greeting                    │
│ "Welcome, Rumpel"           │
├─────────────────────────────┤
│ TODAY'S FOCUS (Card)        │
│ ┌─────────────────────────┐ │
│ │ Today's Focus (Badge)   │ │
│ │ Active Session          │ │
│ ├─────────────────────────┤ │
│ │ 📌 Task 1  09:00        │ │
│ │    Description          │ │
│ │ 📌 Task 2  10:30        │ │
│ │    Description          │ │
│ ├─────────────────────────┤ │
│ │ [Start Focus Timer BTN] │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ STATS ROW                   │
│ ┌─────────────┬───┬───┐    │
│ │ Weekly Prog │✓ │🔥│    │
│ │ 68%         │5 │5 │    │
│ │ ▓▓▓▓▓▒▒▒▒▒ │  │  │    │
│ └─────────────┴───┴───┘    │
├─────────────────────────────┤
│ QUOTE SECTION               │
│ "The capacity to learn..."  │
│ — Brian Herbert             │
│                             │
│ [BottomNav]                 │
└─────────────────────────────┘
```

**Components:**
- TopBar
- Greeting
- Focus Card (tasks, timer button)
- Weekly Progress + Mini Stats
- Quote Section

**State:**
- `todayTasks` - array of today's tasks
- `showTimer` - boolean for focus timer modal

---

### **2. CALENDAR SCREEN** ✅
```
┌─────────────────────────────┐
│ [TopBar]                    │
├─────────────────────────────┤
│ [Week/Month Toggle View]    │
│ ◀ April 2026    ▶           │
├─────────────────────────────┤
│ WEEK VIEW (Default)         │
│ Sun Mon Tue Wed Thu Fri Sat │
│  1   2   3   4   5   6   7   │
│  8   9  10  11  12  13  14   │
│                             │
│ Selected: April 5 (Today)   │
│                             │
│ SELECTED DAY TASKS:         │
│ ┌─────────────────────────┐ │
│ │ ✏️  Task name           │ │
│ │     Description    09:00│ │
│ │ ▪ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▪ │ │
│ │ 🗑️  Edit               │ │
│ │ 🗑️  Delete             │ │
│ └─────────────────────────┘ │
│ [+ Add Task]                │
│                             │
│ [BottomNav]                 │
└─────────────────────────────┘
```

**Components:**
- TopBar
- Date Navigation (◀ Month Year ▶)
- Calendar Grid (Month view toggle)
- Selected Day Tasks Display
- Task CRUD (Create, Read, Update, Delete)
- Add Task Modal

**State:**
- `sel` - selected date {y, m, d}
- `view` - calendar display {y, m}
- `expanded` - week/month toggle
- `showModal` - task creation modal
- `newTask` - form state

**Features:**
- Swipe navigation
- Animation on prev/next
- Task pills with quick actions

---

### **3. SETTINGS SCREEN** ✅
```
┌─────────────────────────────┐
│ [TopBar]                    │
├─────────────────────────────┤
│ PROFILE CARD                │
│ ┌─────────────────────────┐ │
│ │      [Avatar]  ✎        │ │
│ │                         │ │
│ │    Julian Vane          │ │
│ │    Senior Researcher    │ │
│ │    Polymath Level 4     │ │
│ │                         │ │
│ │  "Dedicated to the...   │ │
│ │   pursuit of knowledge" │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ GENERAL PREFERENCES         │
│ ┌─────────────────────────┐ │
│ │ 🔔 Notifications    [🔘]│ │
│ │    Scholarly alerts     │ │
│ ├─────────────────────────┤ │
│ │ 🌙 Dark Mode        [🔘]│ │
│ │    Midnight aesthetics  │ │
│ ├─────────────────────────┤ │
│ │ 🔊 Sound Effects    [🔘]│ │
│ │    Quill & parchment    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ARCHIVE & IDENTITY          │
│ ┌─────────────────────────┐ │
│ │ 📖 About Rumpel      ▶  │ │
│ ├─────────────────────────┤ │
│ │ 🛡️  Privacy Policy   ▶  │ │
│ ├─────────────────────────┤ │
│ │ 📤 Send Feedback     ▶  │ │
│ ├─────────────────────────┤ │
│ │ 🚪 Sign Out          ▶  │ │
│ └─────────────────────────┘ │
│                             │
│ Rumpel Manuscript v2.4.1    │
│                             │
│ [BottomNav]                 │
└─────────────────────────────┘
```

**Components:**
- TopBar
- Profile Card (avatar, name, role, bio)
- Settings List (toggles)
- Navigation Items (danger actions)
- Version Footer

**State:**
- `notifs` - boolean
- `dark` - boolean
- `sounds` - boolean

---

### **4. CHAT MODAL** (Overlay / Full Screen)
```
┌─────────────────────────────┐
│ [X] 🧙 Rumpel               │
├─────────────────────────────┤
│ CONVERSATION                │
│                             │
│ [Alt text]                  │
│ Hey! I'm Rumpel 🧙         │
│ Ask me anything...          │
│                             │
│ USER:                       │
│ ┌─────────────────────────┐ │
│ │ When should I study?    │ │
│ └─────────────────────────┘ │
│                             │
│ ASSISTANT:                  │
│ ┌─────────────────────────┐ │
│ │ 🧙 Based on your       │ │
│ │    schedule, I'd       │ │
│ │    recommend...        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Ask Rumpel…        [➤] │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

**Components:**
- Header with close button
- Messages list (user vs assistant)
- Loading spinner
- Input area with send button

**Features:**
- Gemini API integration
- Auto-scroll to latest message
- Message history in state

---

## 🧭 Navigation Flow

```
┌──────────────────────────────────────────┐
│           HOME SCREEN                    │
│  ┌──────────────────────────────────┐   │
│  │ Focus Card                       │   │
│  │ [Start Focus Timer] ── Timer     │   │
│  │                          Modal   │   │
│  │ Stats, Quote                     │   │
│  └──────────────────────────────────┘   │
└─────────┬────────────────────────────────┘
          │
    [BottomNav Tabs]
    │        │         │        │
    ▼        ▼         ▼        ▼
  HOME    CALENDAR  (removed)  SETTINGS
           │
    ┌──────┴──────────┐
    │  [Add Task]     │
    │  Modal          │
    ▼
  TASK MODAL
    │
    └─ Edit / Delete

[FAB - Rumpel Chat]
    │
    ├─ Quick Chat Input (inline in BottomNav)
    │
    └─ Chat Modal Button (full screen)
```

---

## 🗑️ Removed Feature

### **PLANNER SCREEN** ❌
- File upload functionality
- Gemini AI plan generation
- Time block scheduling
- Complex multi-step workflow
- **Reason**: Complex feature suitable for post-hackathon expansion

---

## 💻 Component Hierarchy (Simplified)

```
App
├── SplashScreen (splash logic)
├── TopBar
├── [Current Screen Component]
│   ├── HomeScreen
│   ├── CalendarScreen
│   ├── SettingsScreen
│   └── [Other screens if needed]
├── ChatModal (overlay)
├── FocusTimer (modal)
├── BottomNav
│   ├── Navigation Pills
│   ├── Rumpel FAB
│   └── Quick Chat Input
└── [Modal Overlays]
```

---

## 📦 Data Flow

```
App State:
├── done (splash screen)
├── tab (current screen)
├── tasks (all tasks by date)
│   └── {dateKey: [taskArray]}
├── bgPlan (from planner - nullable)
├── chatModalOpen (boolean)
```

---

## 🎨 Design System Summary

**Colors:**
- Primary Orange: `#f47b20`
- Dark Brown: `#28180c`
- Medium Brown: `#574237`
- Cream/Bg: `#fff8f5`
- Alert Red: `#ba1a1a`
- Success Green: `#2d6a4f`

**Typography:**
- Headers: "Newsreader" (serif, italic)
- Body: "Work Sans" (sans-serif)
- Special: "Noto Serif" (serif)

**Layout:**
- Phone viewport: 375x812px
- Padding: 12-14px sides
- Border radius: 9-14px
- Gaps: 5-10px

---

## ✅ Hackathon Scope

**In Scope:**
- ✅ UI/UX design (aesthetics)
- ✅ Wireframes (this document)
- ✅ Reusable component templates
- ✅ Basic project structure
- ✅ Pre-built Gemini AI integration
- ✅ Animations (Framer Motion)

**Out of Scope (for expansion later):**
- AI file analysis
- Advanced time blocking
- Synchronization
- Backend database

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📝 File Changes Summary

**Remove from App.jsx:**
- Import PlannerScreen
- Remove PlannerScreen branch from render
- Remove "planner" tab logic

**Remove from BottomNav.jsx:**
- Remove "planner" from tabs array

**Keep:**
- All CSS files (styling still applies to remaining screens)
- All utilities (dateUtils, constants)
- Gemini API (used by ChatModal)

