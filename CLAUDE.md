# CLAUDE.md 

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

- Root app: Vite + React (`src/`) for the client UI.
- Backend proxy: Express server in `server/` for Gemini API calls.
- Production build is configured for GitHub Pages path `/RUMPELSTILTSKIN/` (`vite.config.js`).

## Development commands

### Frontend (repo root)

```bash
npm install
npm run dev
npm run build
npm run preview
npm run deploy
```

### Backend (`server/`)

```bash
cd server
npm install
npm run dev
npm start
```

### Linting and tests

- There are currently **no lint scripts** in `package.json` (root or `server/`).
- There are currently **no test scripts/framework configured** in `package.json` (root or `server/`).
- Running a single test is not available until a test runner is added.

## Environment and feature flags

- Root `.env.local` (frontend):
  - `VITE_API_PROXY` (defaults to `http://localhost:3001` in `src/utils/geminiApi.js`)
- `server/.env.local` (backend):
  - `GEMINI_API_KEY`
  - `PORT` (default `3001`)
- Vite env prefixes are `VITE_` and `RUMPEL_` (`vite.config.js`).
- Calendar feature flag:
  - `RUMPEL_NERF_CALENDAR=1` (or `VITE_RUMPEL_NERF_CALENDAR=1`) disables interactive calendar behavior via `RUMPEL_NERF_CALENDAR` in `src/utils/constants.js`.

## High-level architecture

### App shell and state ownership

- `src/main.jsx` mounts `App` only.
- `src/App.jsx` is the top-level state coordinator:
  - Controls splash/auth gating (`done`, `authChecked`, `loggedIn`).
  - Controls tab switching (`home`, `calendar`, `settings`) without React Router.
  - Owns `tasks` state (`{ [YYYY-MM-DD]: Task[] }`) and passes it to `HomeScreen`, `CalendarScreen`, and `ChatModal`.
  - Owns chat modal open state and entry mode (`text`/`voice`).
  - Manages Firebase auth state and Google access-token caching in `localStorage`.

### Auth and calendar integration

- Firebase setup/providers live in `src/utils/firebaseClient.js`.
  - Google provider includes Calendar scope (`calendar.readonly`).
- `src/components/screens/LoginScreen.jsx` handles email/password and OAuth login/signup flows.
- `src/components/screens/CalendarScreen.jsx` merges:
  - local tasks from app state, and
  - Google events from `src/utils/googleCalendar.js`.
- When calendar is nerfed (`RUMPEL_NERF_CALENDAR`), calendar UI becomes static and token logic is bypassed.

### Chat architecture

- Main chat UI and logic are in `src/components/common/ChatModal.jsx`.
- Client chat API wrapper is `src/utils/geminiApi.js`, which calls `POST {VITE_API_PROXY}/api/chat`.
- ChatModal builds live task-calendar context and appends it to the system prompt.
- ChatModal parses assistant `<task-actions>...</task-actions>` JSON blocks to create tasks directly in app state.
- Backend proxy (`server/server.js`) performs:
  - request validation,
  - mode/purpose normalization (`fast` / `auto` / `default`, `chat` / `title`),
  - model selection and fallback,
  - Gemini API invocation.

### Date/task model

- Date helpers: `src/utils/dateUtils.js`.
- Task data shape used throughout UI:
  - `{ id, title, time, desc, tag }`
  - stored under `YYYY-MM-DD` keys.
- `TODAY` in `src/utils/constants.js` is currently a hardcoded template value, not dynamically derived from system date.

### Styling structure

- `src/styles/index.css` is the style aggregation entry and imports all major style modules.
- Most visual changes should be made in the CSS modules under `src/styles/`.

## Known repo-specific caveats

- `src/components/AuthCallback.jsx` references `react-router-dom` and `../utils/supabaseClient`, but `App` does not route to this component and `supabaseClient` is not present in `src/utils/`.
- There are `.jsx-preview` tooling artifact directories under `src/components/**/node_modules/`; avoid treating them as app source unless working on preview tooling.
