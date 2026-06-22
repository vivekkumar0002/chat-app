# Deploying the Frontend (Vercel)

## 1. Import the project

Vercel Dashboard → Add New → Project → import your repo.
Set **Root Directory** to `client/`.

Vercel auto-detects Next.js — leave build/output settings as default
(`next build`, `.next`).

## 2. Environment variables

In Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-backend-url>/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://<your-backend-url>` (no `/api` suffix) |

Set these for all environments (Production, Preview, Development) so preview
deployments also work against your backend.

## 3. Deploy

Push to your connected branch, or click **Deploy**. Vercel will build and
give you a `https://your-app.vercel.app` URL.

## 4. Connect back to the backend

Take that Vercel URL and set it as `CLIENT_URL` in your backend's environment
variables (Render/Railway), then redeploy the backend so CORS allows requests
from it.

## Notes

- Sockets connect directly from the browser to `NEXT_PUBLIC_SOCKET_URL` — make
  sure your backend host supports WebSocket upgrades (Render and Railway both
  do, no extra config needed).
- If you use a custom domain on Vercel, update `CLIENT_URL` on the backend to
  match it exactly.
