# Deploying the Backend (Render or Railway)

Both platforms work the same way for this project: a Node.js web service
backed by a managed PostgreSQL database.

## 1. Provision PostgreSQL

**Render:** Dashboard → New → PostgreSQL → copy the **Internal Database URL**.
**Railway:** New Project → Provision PostgreSQL → copy `DATABASE_URL` from the Variables tab.

## 2. Create the web service

**Render:**
- New → Web Service → connect your repo, root directory `server/`
- Build command: `npm install && npm run build`
- Start command: `npm start`

**Railway:**
- New Project → Deploy from GitHub → set root directory to `server/`
- Railway auto-detects Node; otherwise set the same build/start commands as above

## 3. Environment variables

Set these in the platform's dashboard (do **not** commit a `.env` file):

| Variable | Value |
|---|---|
| `DATABASE_URL` | from step 1 |
| `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | your deployed Vercel frontend URL, e.g. `https://your-app.vercel.app` |
| `PORT` | usually auto-set by the platform; leave default if so |
| `NODE_ENV` | `production` |

## 4. Run migrations

After the first deploy, run once (Render: Shell tab; Railway: same via CLI or dashboard shell):

```bash
npx prisma migrate deploy
```

This applies the schema in `prisma/schema.prisma` to your production database
without prompting (unlike `migrate dev`).

## 5. Verify

Hit `https://<your-backend-url>/health` — you should get `{"success":true,...}`.

## Notes on scaling

- The in-memory `presenceRegistry` (online/offline tracking) is per-process.
  If you scale to multiple backend instances, add the
  [`socket.io-redis` adapter](https://socket.io/docs/v4/redis-adapter/) and a
  Redis instance so presence and broadcasts work across all instances.
- `helmet`, rate limiting, and CORS are already configured — just make sure
  `CLIENT_URL` matches your real frontend origin exactly (no trailing slash).
