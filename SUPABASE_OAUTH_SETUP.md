# Supabase OAuth Setup Guide

This guide will help you set up Google, Facebook, and Apple OAuth login for RUMPELSTILTSKIN.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - **Project Name**: RUMPELSTILTSKIN (or any name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for it to initialize

## 2. Get Your Supabase Credentials

1. In your Supabase project, go to **Settings > API** (left sidebar)
2. Copy the following values:
   - **Project URL** (labeled as `url`)
   - **Anon public key** (labeled as `anon`)

3. Update your `.env.local` file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 3. Enable OAuth Providers

### Google OAuth

1. Go to **Authentication > Providers** in Supabase
2. Click "Google"
3. You'll see a "Redirect URL" - copy this (usually `https://your-project.supabase.co/auth/v1/callback`)
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Create a new project or select an existing one
6. Enable the "Google+ API"
7. Go to **Credentials** and create an **OAuth 2.0 Client ID** (Web application)
8. Add authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
   - Also add the Supabase redirect URL
9. Copy the **Client ID** and **Client Secret**
10. Paste them into the Supabase Google provider settings
11. Click "Save"

### Facebook OAuth

1. In Supabase, go to **Authentication > Providers > Facebook**
2. Copy the Redirect URL
3. Go to [Facebook Developers](https://developers.facebook.com/)
4. Create a new app (Business type)
5. Add "Facebook Login" product
6. In Settings > Basic, fill in:
   - **App Name**: RUMPELSTILTSKIN
   - **Contact Email**: your@email.com
7. In Products > Facebook Login > Settings, add valid redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
   - The Supabase redirect URL
8. Copy **App ID** and **App Secret** from Settings > Basic
9. Paste them into the Supabase Facebook provider settings
10. Click "Save"

### Apple OAuth

1. In Supabase, go to **Authentication > Providers > Apple**
2. Copy the Service ID shown
3. Go to [Apple Developer Account](https://developer.apple.com/)
4. Go to **Certificates, Identifiers & Profiles > Identifiers**
5. Create a new App ID:
   - Set as a Service ID (not App ID)
   - Enter the Service ID from Supabase
6. Enable "Sign in with Apple"
7. Configure the redirect URLs:
   - The Supabase callback URL
8. Go to **Keys** and create a new key for "Sign in with Apple"
9. Download the key file
10. Generate a client secret using the key (requires JWT encoding)
11. Paste credentials into Supabase Apple provider settings
12. Click "Save"

## 4. Update Your App

The social login buttons in your app are now connected to Supabase OAuth. When users click:
- **Continue with Google** → Google login flow
- **Continue with Facebook** → Facebook login flow
- **Continue with Apple** → Apple login flow

After successful authentication, users are redirected to the callback page, then to your app.

## 5. Test the Flow

1. Run your app: `npm run dev`
2. Click a social login button
3. Complete the OAuth flow
4. You should be redirected back to your app

## Troubleshooting

- **"Invalid redirect_uri"**: Make sure all redirect URIs in OAuth provider settings match your callback URL
- **CORS errors**: Check that your Supabase project allows your domain
- **"Provider not enabled"**: Go back to Supabase Auth settings and ensure the provider is enabled
- **Callback not working**: Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Production Deployment

Before deploying to production:
1. Update redirect URIs in all OAuth providers to your production domain
2. Update `.env` on your production server with production Supabase credentials
3. Test the full OAuth flow on production
