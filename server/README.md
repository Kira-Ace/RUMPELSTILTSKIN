# Rumpel Chat Server

Express backend for server-side Gemini chat completions. The browser only sends app-level chat input to this server; Gemini request shaping, model fallback, and the API key stay server-side.

## Local Setup

### 1. Create a server env file

Copy [server/.env.example](server/.env.example) to `server/.env.local` and set your key:

```bash
GEMINI_API_KEY=your-api-key-here
PORT=3001
```

Recommended: keep Gemini secrets in `server/.env.local` only. The server still supports older root-level env setup as a fallback, but that path is deprecated.

### 2. Install and run the server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3001` by default.

### 3. Run the frontend

In the repo root, set the frontend proxy URL if needed:

```bash
VITE_API_PROXY=http://localhost:3001
```

Then start the client:

```bash
npm run dev
```

## API Endpoints

### POST /api/chat

App-level chat endpoint. The client sends conversation data, not raw Gemini payloads.

**Request:**

```json
{
  "messages": [
    { "role": "user", "text": "Help me plan my week" },
    { "role": "assistant", "text": "What kind of week are you planning for?" }
  ],
  "userMessage": "Focus on study blocks",
  "attachments": [
    {
      "name": "schedule.png",
      "mime": "image/png",
      "data": "<base64>"
    }
  ],
  "mode": "auto",
  "purpose": "chat"
}
```

**Response:**

```json
{
  "text": "Here is a study-first weekly plan...",
  "model": "gemini-2.5-flash"
}
```

**Supported fields:**

- `messages`: prior chat history with `role`, `text`, and optional `attachments`
- `userMessage`: the latest user input
- `attachments`: current request attachments as `{ name, mime, data }`
- `mode`: `fast`, `auto`, or `default`
- `purpose`: `chat` or `title`

**Errors:**

- `400`: invalid request body or missing user input
- `500`: missing server API key or upstream failure

### GET /health

Simple health check endpoint.

## Deployment

Deploy the `server/` folder to your Node host of choice and set `GEMINI_API_KEY` in the platform's environment settings.

Examples:

- Vercel
- Railway
- Render
- Heroku
- Your own VPS or Docker host

Point the frontend at the deployed backend with `VITE_API_PROXY=https://your-server.example.com`.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change `PORT` or free `:3001` |
| "API key not configured" | Create `server/.env.local` with `GEMINI_API_KEY=...` |
| Connection refused | Start the backend from `server/` with `npm run dev` |
| 403 Forbidden | Rotate the key in Google Cloud and update the server env |
| Large attachment failures | Reduce file size or raise the JSON body limit intentionally |

## Security Notes

Do:

- Keep `server/.env.local` out of source control
- Restrict the Gemini key in Google Cloud if possible
- Use HTTPS in deployed environments

Do not:

- Put Gemini secrets in Vite-exposed env variables
- Expose this endpoint publicly without auth or rate limiting if the app will be internet-facing
- Return raw secrets in logs or HTTP error responses
