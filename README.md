# Real-Time Chat Application

A WhatsApp/Discord-inspired real-time chat app: Next.js 15 + Socket.IO +
Express + PostgreSQL/Prisma, with JWT auth, typing indicators, read receipts,
and online presence.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT + bcrypt |

## Project structure

```
chat-app/
├── client/                  # Next.js frontend
│   ├── app/                 # login, register, chat, profile pages
│   ├── components/          # ui/, chat/, layout/
│   ├── hooks/                # useAuth, useSocket, useMessages, useTyping, ...
│   ├── lib/                  # axios client, socket.io client
│   ├── services/              # API call wrappers
│   └── types/
└── server/                   # Express + Socket.IO backend
    ├── prisma/
    │   ├── schema.prisma      # Users, Conversations, Participants, Messages
    │   └── seed.ts
    └── src/
        ├── config/            # env, prisma client
        ├── controllers/
        ├── routes/
        ├── middleware/        # auth, error, rate-limit, validation
        ├── services/          # business logic
        ├── sockets/           # Socket.IO handlers + presence registry
        ├── utils/
        └── types/
```

## Prerequisites

- Node.js 18+
- A PostgreSQL database (local install, or a free instance on
  [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway)

## 1. Backend setup

```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL, and generate a JWT_SECRET, e.g.:
# openssl rand -hex 32

npm install            # also runs `prisma generate` via postinstall
npx prisma migrate dev --name init
npm run seed            # optional: creates 3 demo users, password "password123"
npm run dev              # starts on http://localhost:5000
```

Verify it's running: `curl http://localhost:5000/health`

## 2. Frontend setup

In a new terminal:

```bash
cd client
cp .env.local.example .env.local
# defaults already point to http://localhost:5000 — fine for local dev

npm install
npm run dev               # starts on http://localhost:3000
```

Open `http://localhost:3000`, register two accounts (e.g. in two browser
windows / incognito), search for each other, and start chatting.

## How it works

### Auth flow
Register/login hits the Express API, which returns a JWT. The frontend
stores it in `localStorage` and attaches it as a `Bearer` token on every API
request (`lib/apiClient.ts`) and on the Socket.IO handshake
(`lib/socketClient.ts`). The backend verifies it both for REST routes
(`middleware/auth.middleware.ts`) and for socket connections
(`sockets/socketAuth.ts`).

### Real-time messaging
Sending a message emits `send_message` over the socket; the server persists
it via Prisma, then broadcasts `receive_message` to everyone in that
conversation's room (`conversation:<id>`). Each connected user also joins a
personal room (`user:<id>`), used for status events. Presence (online/offline)
is tracked in-memory per user across all their open tabs/devices
(`sockets/presenceRegistry.ts`).

### Typing indicators & read receipts
`typing_start`/`typing_stop` are relayed directly between sockets in a room
(no DB writes). Read receipts (`message_read`) update each message's status
in the DB and notify the conversation, which the UI reflects as
✓ Sent → ✓✓ Delivered → ✓✓ Read (blue).

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Log in, get JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| POST | `/api/auth/logout` | ✓ | Mark offline |
| GET | `/api/users?search=` | ✓ | List/search users |
| GET | `/api/users/:id` | ✓ | Get one user |
| PATCH | `/api/users/me` | ✓ | Update own profile |
| GET | `/api/conversations` | ✓ | List your conversations (with last message + unread count) |
| POST | `/api/conversations` | ✓ | Create/get a 1:1 conversation: `{ userId }` |
| GET | `/api/conversations/:id` | ✓ | Get one conversation |
| POST | `/api/conversations/:id/read` | ✓ | Mark conversation as read |
| GET | `/api/messages/:conversationId` | ✓ | Message history |
| POST | `/api/messages` | ✓ | Send a message (REST fallback) |

## Socket.IO events

| Event | Direction | Payload |
|---|---|---|
| `connect` / `disconnect` | — | — |
| `send_message` | client → server | `{ conversationId, content }` (ack returns the saved message) |
| `receive_message` | server → client | full message object |
| `typing_start` / `typing_stop` | both | `{ conversationId, userName }` |
| `user_online` / `user_offline` | server → client | `{ userId, isOnline, lastSeen }` |
| `message_read` | both | `{ conversationId, userId, messageIds }` |
| `join_conversation` | client → server | `conversationId` (string) |

## Deployment

See [`server/DEPLOYMENT.md`](server/DEPLOYMENT.md) (Render/Railway) and
[`client/DEPLOYMENT.md`](client/DEPLOYMENT.md) (Vercel).

## Security notes

- Passwords hashed with bcrypt (12 salt rounds); never returned in API responses.
- JWT required on all routes except register/login.
- `express-rate-limit` on all `/api` routes, with a stricter limit on auth endpoints.
- `helmet` for standard security headers; CORS locked to `CLIENT_URL`.
- All inputs validated with `express-validator` before hitting business logic.

## Known limitations / next steps

- Presence tracking is in-memory and per-process — fine for a single backend
  instance; add a Redis-backed Socket.IO adapter before scaling horizontally.
- One-to-one chat only; the schema (`isGroup`, `name` on `Conversation`)
  is already shaped to extend into group chats with relatively small changes
  to `conversation.service.ts` and the UI.
- No file/image attachments yet — `Message.content` is text-only.
