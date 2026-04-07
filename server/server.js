import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.VITE_GOOGLE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * POST /api/chat
 * Proxy endpoint for Gemini chat API
 * Body: { model, contents, generationConfig }
 */
app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const { model, contents, generationConfig } = req.body;

  if (!model || !contents) {
    return res.status(400).json({ error: 'Missing model or contents' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || {
          maxOutputTokens: 1000,
          temperature: 0.8,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'API Error';
      console.error(`Model ${model} failed: ${errMsg}`);
      return res.status(response.status).json({ error: errMsg });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No text in response' });
    }

    res.json({ text, model });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Rumpel API Proxy running on http://localhost:${PORT}`);
  console.log(`  Chat endpoint: POST /api/chat`);
});
