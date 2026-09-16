# Deploying DebateAI on Vercel

This application is configured for turnkey deployment on **Vercel** as a full-stack web app with Vite React frontend and Vercel Serverless Functions for all API endpoints.

---

## 1. Quick Deploy via Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your repository.
4. Vercel will automatically detect the settings from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **API Functions**: Automatically detected in the `/api` directory.

---

## 2. Environment Variables in Vercel

In your Vercel Project Settings under **Settings > Environment Variables**, add:

| Key | Required | Value / Description |
|-----|----------|---------------------|
| `GEMINI_API_KEY` | **Yes** | Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) |
| `JWT_SECRET` | Optional | A random secure string for JWT tokens (defaults to a built-in key if omitted) |

---

## 3. Architecture & Routing Details

- **Frontend**: Vite + React 19 + Tailwind CSS compiled into `/dist`.
- **Backend API**: Serverless functions in `/api/index.ts` and `/api/[...path].ts` handle all `/api/*` endpoints (`/api/debate`, `/api/analyze`, `/api/fallacies`, `/api/judge`, `/api/auth/*`, etc.).
- **Client Fallback**: If `GEMINI_API_KEY` is not provided or the backend is unreachable, the client-side heuristic engine transparently ensures debates and logical evaluations continue without breaking.
- **Single Page App (SPA) Rewrites**: `vercel.json` guarantees direct page reloads route to `/index.html` while all `/api/*` requests route to Vercel Serverless Functions.
