# OAuth Login Setup - Quick Start

Your app now has functional OAuth login buttons! Follow these steps to get it working.

## Step 1: Create a Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for it to initialize (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the **Project URL** and **Anon Key**
3. Update `.env.local` in your project:
   ```
   VITE_SUPABASE_URL=your-project-url-here
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up OAuth Providers

### For Google:
1. In Supabase, go to **Authentication > Providers > Google**
2. Note the **Redirect URL** shown (copy it)
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create an OAuth 2.0 Client ID (type: Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (for local development)
   - Your production URL (when deploying)
6. Copy Client ID and Secret
7. Paste them into Supabase settings for Google
8. Save

### For Facebook:
1. In Supabase, go to **Authentication > Providers > Facebook**
2. Note the **Redirect URL** shown
3. Go to [Facebook Developers](https://developers.facebook.com)
4. Create a new app → Add "Facebook Login"
5. In app settings, add Valid Redirect URIs:
   - `http://localhost:5173/auth/callback`
   - Your production URL
6. Copy App ID and Secret
7. Paste into Supabase
8. Save

### For Apple:
1. In Supabase, go to **Authentication > Providers > Apple**
2. Go to [Apple Developer](https://developer.apple.com)
3. Create a Service ID and configure "Sign in with Apple"
4. Set up redirect URLs matching your app
5. Generate credentials and add to Supabase
6. Save

## Step 4: Test It!

1. Run your app: `npm run dev`
2. Click "Continue with Google", "Facebook", or "Apple"
3. Complete the OAuth flow
4. You'll be automatically logged in!

## What's Happening Behind the Scenes

- When users click a social login button, they're redirected to that provider's login page
- After they authorize, they're redirected back to your app
- Supabase handles the session automatically
- Your app logs them in and shows the main screen

## Environment Variables

Your `.env.local` now includes:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public authentication key

**Keep these private! Don't commit them to version control.**

## Troubleshooting

**"Invalid redirect_uri"**
- Make sure all OAuth provider settings have the correct redirect URL

**"Provider not enabled"**
- Go back to Supabase Auth settings and click toggle to enable

**Buttons not working**
- Check browser console for errors
- Verify `.env.local` has correct URL and key

**Still need help?**
- See `SUPABASE_OAUTH_SETUP.md` for detailed setup instructions
