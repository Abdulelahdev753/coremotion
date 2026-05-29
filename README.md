# CoreMotion Web

A monorepo containing the CoreMotion web application:

- **`frontend/`** — [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS, ESLint)
- **`backend/`** — [Express](https://expressjs.com) (TypeScript, served with `tsx`)

## Prerequisites

- Node.js 20+ (tested on Node 24)
- npm 10+

## Getting started

Install dependencies for the root, frontend, and backend:

```bash
npm run install:all
```

Run **both** the frontend and backend together (recommended for development):

```bash
npm run dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000

The homepage fetches `GET /api/hello` from the backend to confirm the two are wired together.

## Running each app individually

```bash
npm run dev:frontend   # Next.js dev server on :3000
npm run dev:backend    # Express dev server on :4000 (auto-reloads via tsx watch)
```

## Building for production

```bash
npm run build          # builds frontend (.next) and backend (dist/)
npm run start          # runs both production servers
```

## Environment variables

Each app ships an `.env.example`. Copy it to a local env file and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| App      | Variable              | Default                 | Description                          |
| -------- | --------------------- | ----------------------- | ------------------------------------ |
| backend  | `PORT`                | `4000`                  | Port the Express server listens on   |
| backend  | `CORS_ORIGIN`         | `http://localhost:3000` | Allowed origin for CORS              |
| frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL the frontend calls          |

## API routes

| Method | Route         | Description                  |
| ------ | ------------- | ---------------------------- |
| GET    | `/`           | API name + status           |
| GET    | `/api/health` | Health check (uptime, time) |
| GET    | `/api/hello`  | Sample JSON message          |

## Project structure

```
coremotion-web/
├── frontend/            # Next.js app
│   └── src/app/         # App Router pages
├── backend/             # Express API
│   └── src/
│       ├── index.ts     # Server entry point
│       ├── app.ts       # Express app + middleware
│       └── routes/      # Route handlers
├── package.json         # Root scripts (run both apps via concurrently)
└── README.md
```
