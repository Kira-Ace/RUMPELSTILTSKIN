# 🧙 Rumpel - Hackathon Template Guide

This project is a fully **templated** task management and AI chat app. Customize every aspect for your hackathon submission.

---

## 🚀 Quick Customization Checklist

- [ ] Update app name in `constants.js` and component files
- [ ] Set up Google Gemini API key in `.env.local`
- [ ] Replace user profile data in `SettingsScreen.jsx`
- [ ] Add motivational quotes to `Greeting.jsx`
- [ ] Customize stats calculations in `HomeScreen.jsx`
- [ ] Update app logo and assets
- [ ] Modify color scheme in CSS files if desired
- [ ] Add sample tasks to initial state

---

## 📝 Customization Guide by Component

### 1️⃣ **App Name & Branding**

**File:** `src/utils/constants.js`
```javascript
// TEMPLATE: Update these for your app
export const APP_NAME = "{{YOUR_APP_NAME}}";
export const APP_VERSION = "1.0.0";
```

**Files to Update:**
- `src/components/common/TopBar.jsx` - Replace logo image
- `src/components/screens/SettingsScreen.jsx` - Update version number
- `package.json` - Update `"name"` field

---

### 2️⃣ **User Profile**

**File:** `src/components/screens/SettingsScreen.jsx`

Replace placeholders:
```javascript
// OLD:
<div className="profile-name">{{USER_NAME}}</div>
<div className="profile-role">{{USER_ROLE}} · {{USER_LEVEL}}</div>
<div className="profile-bio">{{USER_BIO}}</div>

// NEW (example):
<div className="profile-name">Alex Chen</div>
<div className="profile-role">Product Manager · Engineer Level 3</div>
<div className="profile-bio">Passionate about building tools that help teams ship faster.</div>
```

---

### 3️⃣ **Home Screen Greeting**

**File:** `src/components/common/Greeting.jsx`

Add more greeting variations:
```javascript
const GREETINGS = [
  "What's kirking,",
  "Ready to learn,",
  "Time to grow,",
  "Let's ship,",           // Add your own
  "Today's the day,",
  "Keep grinding,",
  // {{ADD_MORE_GREETINGS_HERE}}
];
```

---

### 4️⃣ **Home Screen Stats & Quote**

**File:** `src/components/screens/HomeScreen.jsx`

Replace placeholders:
```javascript
// Weekly Progress (currently 68%)
<div className="progress-num">68 <span className="progress-pct">%</span></div>

// Streak Count (currently 5)
<div className="mini-card-num">5</div>

// Quote (replace with your own)
<p className="quote-text">"{{QUOTE_TEXT}}"</p>
<p className="quote-attr">— {{QUOTE_AUTHOR}}</p>
```

**Tip:** Make these dynamic by calculating from `tasks` state instead of hardcoding.

---

### 5️⃣ **Gemini AI Setup**

**File:** `.env.local` (create this in project root)

```
VITE_GOOGLE_API_KEY={{YOUR_API_KEY_HERE}}
```

**Steps:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `.env.local`
4. Add `.env.local` to `.gitignore` (already done)

**File:** `src/utils/geminiApi.js`

The API integration is already set up. Customize the system prompt in `callGeminiChat()` to change AI personality:

```javascript
// In callGeminiChat function, find the system message and customize:
const systemPrompt = "You are {{AI_PERSONALITY}}. {{CUSTOM_INSTRUCTIONS}}.";
```

---

### 6️⃣ **Initial Tasks**

**File:** `src/utils/constants.js`

Add sample tasks:
```javascript
export const initialTasks = {
  "2026-04-02": [
    {
      id: 1,
      title: "Review project proposal",
      time: "09:00",
      desc: "Check latest feedback",
      tag: "Work"
    },
    {
      id: 2,
      title: "Team standup",
      time: "10:30",
      desc: "",
      tag: "Meeting"
    }
  ],
  "2026-04-03": [
    {
      id: 3,
      title: "Design wireframes",
      time: "14:00",
      desc: "Mobile and desktop layouts",
      tag: "Design"
    }
  ]
};
```

---

### 7️⃣ **Assets & Images**

Replace these images in `src/components/assets/`:
- `rumpel.png` - App icon/mascot
- `rumpeltext.png` - App wordmark/logo
- Any other brand assets

---

### 8️⃣ **Color Theme**

**File:** `src/styles/global.css` (or any CSS file)

Search for color variables and customize:
```css
:root {
  --brown:      #28180c;      /* Primary dark color */
  --brown-m:    #574237;      /* Secondary dark */
  --orange:     #994700;      /* Accent primary */
  --orange-m:   #f47b20;      /* Accent secondary */
  --yellow:     #fdcf49;      /* Success/highlight */
  --green:      #2d6a4f;      /* Action/positive */
  --red:        #ba1a1a;      /* Danger/alerts */
}
```

---

## 🎯 Feature Overview (What's Included)

### ✅ Core Features
- **Home Screen** - Daily focus, stats, motivational quote
- **Calendar** - View/create/edit/delete tasks by date
- **Settings** - User profile, preferences (notifications, dark mode, sound)
- **Chat Modal** - AI assistant powered by Google Gemini

### ✅ Components
- **TopBar** - Navigation header with logo and avatar
- **BottomNav** - 3-tab navigation + AI chatbot FAB
- **FocusTimer** - Pomodoro-style focus session timer
- **ChatModal** - Full-screen AI conversation interface

### ❌ Removed Features (Niche)
- PlannerScreen - Complex AI file upload & plan generation
- TimeBlockSchedule - Advanced scheduling UI
- TaskCalendarPlacement - Unused component

---

## 📦 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── TopBar.jsx         ← Logo & user avatar
│   │   ├── BottomNav.jsx      ← Navigation + AI FAB
│   │   ├── ChatModal.jsx      ← AI assistant modal
│   │   ├── FocusTimer.jsx     ← Pomodoro timer
│   │   └── Toggle.jsx         ← Reusable toggle switch
│   ├── screens/
│   │   ├── SplashScreen.jsx   ← Initial loading screen
│   │   ├── HomeScreen.jsx     ← Daily focus & stats
│   │   ├── CalendarScreen.jsx ← Task management
│   │   └── SettingsScreen.jsx ← User profile & settings
│   └── assets/
│       ├── rumpel.png         ← IconIcon/mascot
│       └── rumpeltext.png     ← Logo/wordmark
├── styles/
│   ├── global.css             ← Theme colors & defaults
│   ├── index.css              ← Main styles
│   └── [component].css        ← Component-specific styles
├── utils/
│   ├── constants.js           ← App config, initial data
│   ├── dateUtils.js           ← Date manipulation helpers
│   └── geminiApi.js           ← AI API integration
└── App.jsx                    ← Main app component

```

---

## 🔧 Development Workflow

### Setup
```bash
npm install
```

### Start Development
```bash
npm run dev
# Opens http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🧙 AI Customization

The chatbot uses **Google Gemini API** with automatic model fallback.

### Customize AI Personality

**File:** `src/utils/geminiApi.js`

Find the `callGeminiChat` function and modify the system prompt:

```javascript
// Current implementation (basic):
// Modify to add custom instructions specific to your app
```

### Conversation Flow

The ChatModal maintains a conversation history. To add context:
1. Prepend system message with custom instructions
2. Include user context (tasks, goals, etc.) in prompts
3. Customize response handling in `ChatModal.jsx`

---

## 📱 Mobile-First Design

- Viewport: **375px × 812px** (iPhone-sized)
- All layouts optimized for mobile first, desktop-friendly
- Use Framer Motion for animations

---

## 🚨 Important Notes

### `.env.local` (NOT in git)
```
VITE_GOOGLE_API_KEY={{YOUR_KEY}}
```

### API Key Security
- Never commit `.env.local` to git
- Use environment-specific keys for production
- Set up API quotas in Google Cloud Console

### Model Fallback
If a Gemini model is unavailable, the app automatically tries alternatives:
1. `gemini-2.5-flash` (default, fastest)
2. `gemini-2.0-flash`
3. `gemini-2.5-pro`
4. `gemini-2.0-flash-001`
5. `gemini-1.5-pro`

---

## 🎨 Key Files to Customize

**Highest Priority:**
1. `src/utils/constants.js` - App name, initial data
2. `.env.local` - API key setup
3. `src/components/screens/SettingsScreen.jsx` - User profile
4. `src/components/common/Greeting.jsx` - Greetings

**Medium Priority:**
1. `src/components/screens/HomeScreen.jsx` - Stats & quotes
2. `src/components/common/TopBar.jsx` - Logo
3. `src/components/assets/*` - Images

**Nice-to-Have:**
1. `src/styles/global.css` - Colors
2. `src/utils/geminiApi.js` - AI personality

---

## 💡 Hackathon Tips

1. **MVP First** - Get core features working, polish later
2. **Use Placeholders** - Keep customization easy during demo
3. **Sample Data** - Add realistic initial tasks
4. **Test AI** - Verify Gemini API is working before submission
5. **Mobile Demo** - Build responsive, test on phone
6. **Error Handling** - Add fallback if API fails

---

## 📖 Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/) - Animations
- [Lucide React Icons](https://lucide.dev/) - Icon library
- [Google Generative AI](https://ai.google.dev/) - Gemini API docs
- [Vite Docs](https://vitejs.dev/) - Build tool

---

## ✨ Need Help?

Each component file has `TEMPLATE:` comments marking customization points. Search for `{{PLACEHOLDER}}` or `TEMPLATE:` to find all areas that need your app-specific data.

Happy hacking! 🚀

