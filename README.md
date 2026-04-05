# 🧙 {{APP_NAME}} - Hackathon Submission Template

A modern task management and AI assistant app built with React + Vite + Gemini AI.

**Perfect for:** Hackathons, MVP prototypes, study planners, or any task-based app.

---

## ✨ Features

- 📱 **Mobile-First UI** - Beautiful phone interface with smooth animations
- 🤖 **AI Assistant** - Chat with Gemini-powered chatbot  
- 📅 **Calendar Management** - Create, edit, view tasks by date
- ⏱️ **Focus Timer** - Pomodoro-style productivity tracking
- ⚙️ **User Settings** - Profile, preferences, notifications
- 🎨 **Fully Templated** - Customize every aspect for your app

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Gemini API
Create `.env.local` in the root directory:
```
VITE_GOOGLE_API_KEY={{YOUR_API_KEY}}
```

Get a free API key: https://aistudio.google.com/app/apikey

### 3. Start Development
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📋 Customization

See [TEMPLATE.md](./TEMPLATE.md) for a complete customization guide.

**Quick customization checklist:**
- [ ] App name in `src/utils/constants.js`
- [ ] User profile in `src/components/screens/SettingsScreen.jsx`
- [ ] Greetings in `src/components/common/Greeting.jsx`  
- [ ] Logo/assets in `src/components/assets/`
- [ ] Google API key in `.env.local`
- [ ] Initial tasks data in `src/utils/constants.js`

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/       ← Reusable UI components
│   ├── screens/      ← Main app screens
│   └── assets/       ← Images, icons
├── styles/           ← CSS stylesheets
├── utils/            ← Helpers, API calls, constants
└── App.jsx           ← Main app component
```

---

## 🔧 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool (fast dev server)
- **Framer Motion** - Animations
- **Lucide React** - Icon library
- **Google Gemini API** - AI integration

---

## 🎯 Included Screens

| Screen | Purpose |
|--------|---------|
| **Home** | Daily focus, stats, progress |
| **Calendar** | Task management by date |
| **Chat** | AI assistant modal |
| **Settings** | User profile & preferences |

---

## 🧙 AI Integration

The app uses Google's Generative AI (Gemini) for the chatbot.

- Automatic model fallback for reliability
- Real-time conversation history
- Customizable system prompts

To customize AI personality, edit the system prompt in `src/utils/geminiApi.js`.

---

## 📱 Responsive Design

- Optimized for **375px × 812px** (iPhone viewport)
- Mobile-first approach
- Smooth animations with Framer Motion

---

## 🚮 What Was Removed

This is a focused MVP template. Removed features:
- ❌ PlannerScreen (complex file upload)
- ❌ TimeBlockSchedule (advanced scheduling)
- ❌ TaskCalendarPlacement (unused UI)

---

## 💡 Hackathon Tips

1. customize the greeting messages for personality
2. Add sample tasks to `initialTasks` in `constants.js`
3. Update user profile in Settings
4. Test Gemini API key before submission
5. Build responsive, test on mobile

---

## 📖 Useful Links

- [TEMPLATE.md](./TEMPLATE.md) - Full customization guide
- [Google AI Studio](https://aistudio.google.com/) - Get free API key
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📄 License

Use freely for hackathons and learning.

---

**Made with ❤️ for hackathon builders**
