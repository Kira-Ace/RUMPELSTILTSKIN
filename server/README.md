# Rumpel API Proxy Server

Simple Express.js backend that securely proxies requests to the Google Gemini API.

## Why a Proxy?

Exposing API keys in client-side code is a security risk. This proxy keeps your secret key server-side only.

## Setup

### 1. Get an API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Generative Language API**
4. Create an API key (Application default / Unrestricted for dev)
5. Copy the key

### 2. Configure Environment

Create a `.env.local` file in the **root directory** (not in `server/`):

```bash
VITE_GOOGLE_API_KEY=your-api-key-here
```

The proxy will read this from the parent directory.

### 3. Install & Run

```bash
cd server
npm install
npm run dev     # Watch mode
# or
npm start       # Single run
```

Server runs on `http://localhost:3001` by default.

### 4. Run Frontend (in separate terminal)

```bash
npm run dev
```

Frontend will call `http://localhost:3001/api/chat` automatically.

## API Endpoints

### POST /api/chat

**Request:**
```json
{
  "model": "gemini-2.5-flash",
  "contents": [{ "role": "user", "parts": [{ "text": "Hello" }] }],
  "generationConfig": {
    "maxOutputTokens": 1000,
    "temperature": 0.8
  }
}
```

**Response:**
```json
{
  "text": "Response from Gemini",
  "model": "gemini-2.5-flash"
}
```

**Errors:**
- `400`: Missing model or contents
- `500`: API key not configured or API error
- Returns `{ error: "message" }`

### GET /health

Simple health check endpoint.

## Deployment

### Local Network
Frontend and server both run locally during dev.

### Production Deployment

Deploy the `server/` folder to:

- **Vercel** (Node.js): https://vercel.com
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **Your own VPS/Docker**

Then update `.env.local` in frontend:
```bash
VITE_API_PROXY=https://your-deployed-proxy.com
```

### Environment Variable

The proxy reads `VITE_GOOGLE_API_KEY` from:
1. Root `.env.local` (for local dev)
2. Platform environment variables (for deployed server)

On Vercel/Railway/Render, add the env var in their dashboard.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change `PORT` env var or kill process using :3001 |
| "API key not configured" | Ensure `.env.local` exists in **root** with `VITE_GOOGLE_API_KEY=...` |
| CORS errors | Check that proxy has `cors()` middleware enabled |
| 403 Forbidden | API key is leaked/disabled. Create a new one in Google Cloud Console |
| Connection refused | Ensure proxy is running (`npm run dev` in `server/` folder) |

## Security Notes

✅ **Do:**
- Keep `.env.local` in `.gitignore` (never commit API keys)
- Use strong API key restrictions in Google Cloud (if possible)
- Deploy proxy to HTTPS only
- Use environment variables for production keys

❌ **Don't:**
- Expose the proxy endpoint without authentication if public-facing
- Commit `.env.local` to Git
- Show API keys in logs/errors to users
