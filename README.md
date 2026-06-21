# UltraFit — MotionCore Web Application

A full-stack, bilingual (Arabic / English) fitness platform that generates personalized nutrition and training plans from a short user assessment. Built as a production-ready monorepo and deployed as a single containerized service.

---

## What the project does

**MotionCore** is the core product — a smart fitness assessment engine that turns a handful of body metrics and lifestyle answers into a complete, science-backed daily plan:

| Output | Detail |
|---|---|
| **Daily calorie target** | Calculated via Mifflin-St Jeor BMR → TDEE, then adjusted for the user's goal and pace |
| **Macro breakdown** | Protein, carbs, and fat targets — split by goal (fat loss / muscle gain / fitness) |
| **Daily meal plan** | 5 meal slots (breakfast, lunch, dinner, 2 snacks) using familiar local foods, portioned to hit exact macro targets |
| **Weekly workout plan** | Structured resistance program adapted to training level (beginner / intermediate / advanced) and available equipment (none / dumbbells / full gym) |
| **Weight tracker** | Log weigh-ins; the system compares the real trend to the expected rate and suggests calorie adjustments |

The UI is fully bilingual: Arabic (RTL) and English (LTR), toggled live without a page reload.

---

## Tech stack

### Frontend
- **Next.js 15** (App Router, TypeScript) — statically exported for zero-runtime server cost
- **Tailwind CSS** — utility-first styling with a custom brand design system
- **shadcn/ui** — accessible, headless component primitives
- **Lucide React** — icon library
- Client-side state persisted in `localStorage`; no account or login required

### Backend
- **Express** (TypeScript) — REST API server
- **Helmet** — HTTP security headers
- **Morgan** — request logging
- Serves the statically-exported Next.js frontend on the same port (single-port deployment)

### Infrastructure
- **Docker** — single multi-stage `Dockerfile` bundles both apps into one image
- **Monorepo** — root `package.json` orchestrates `frontend/` and `backend/` with `concurrently`

---

## Project structure

```
coremotion-web/
├── frontend/                     # Next.js application
│   └── src/
│       ├── app/                  # App Router pages
│       │   ├── page.tsx          # Marketing landing page
│       │   └── motioncore/       # MotionCore feature pages
│       │       ├── page.tsx          # MotionCore landing
│       │       ├── assessment/       # Multi-step assessment wizard
│       │       └── dashboard/        # Personalized plan dashboard
│       ├── components/
│       │   ├── motioncore/       # Assessment flow, dashboard, charts
│       │   ├── site/             # Navbar, hero, language toggle
│       │   └── ui/               # Shared UI primitives
│       ├── lib/motioncore/       # Pure calculation & data layer
│       │   ├── engine.ts         # BMR/TDEE/macro engine
│       │   ├── meal-planner.ts   # Deterministic meal-plan builder
│       │   ├── workout-planner.ts# Weekly training-plan builder
│       │   └── data/             # USDA-verified food & exercise data
│       └── i18n/                 # Arabic & English dictionaries
├── backend/                      # Express API server
│   └── src/
│       ├── app.ts                # Express app, static file serving
│       ├── index.ts              # Server entry point
│       └── routes/health.ts      # Health-check endpoint
├── Dockerfile                    # Single-image build
└── package.json                  # Monorepo scripts
```

---

## How the calculation engine works

1. **BMR** — Mifflin-St Jeor equation using sex, weight, height, and age.
2. **TDEE** — BMR × activity multiplier (1.2 sedentary → 1.9 athlete).
3. **Calorie target** — TDEE adjusted by a weekly kg-rate deficit/surplus, clamped to a safe minimum (1 200 kcal for women, 1 500 kcal for men) and a maximum 25 % TDEE deficit.
4. **Macros** — Protein set by goal (2.0 g/kg fat loss, 1.8 g/kg muscle gain, 1.6 g/kg fitness), fat floored at 0.6 g/kg, carbs fill the remainder.
5. **Meal plan** — A deterministic seed (hash of the assessment) picks from a library of USDA-verified foods and scales portions to the macro targets.
6. **Workout plan** — A weekly split is selected by training level and equipment; exercises are pulled from a tagged exercise library.
7. **Recalibration** — After 4+ weigh-ins over 10+ days the system computes the real weekly rate and suggests a ±kcal adjustment if the trend diverges from the expected rate.

---

## Getting started

### Prerequisites
- Node.js 20+ (tested on Node 24)
- npm 10+

### Install all dependencies
```bash
npm run install:all
```

### Run in development (both apps, recommended)
```bash
npm run dev
```
- Frontend → http://localhost:3000
- Backend → http://localhost:4000

### Run each app individually
```bash
npm run dev:frontend    # Next.js dev server on :3000
npm run dev:backend     # Express dev server on :4000 (auto-reloads via tsx watch)
```

### Build and run for production
```bash
npm run build           # Builds frontend (static export) and backend (compiled JS)
npm run start           # Runs the Express server which serves both frontend and API
```

### Docker (single-port deployment)
```bash
docker build -t ultrafit .
docker run -p 3000:3000 ultrafit
```
The entire application (frontend + API) is available at http://localhost:3000.

---

## Environment variables

Copy the example files and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| App | Variable | Default | Description |
|---|---|---|---|
| backend | `PORT` | `3000` | Port the Express server listens on |
| backend | `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL (dev only) |

---

## API endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns uptime and server time |

---

## Features at a glance

- **Bilingual** — full Arabic (RTL) and English (LTR) support, switched live
- **Offline-capable** — the full plan is computed client-side and stored in `localStorage`; no account or server round-trip required
- **Science-backed formulas** — Mifflin-St Jeor BMR, TDEE activity multipliers, evidence-based macro splits
- **Diet-exclusion aware** — meal plans avoid dairy, eggs, nuts, gluten, or seafood when flagged
- **Responsive** — works on mobile, tablet, and desktop
- **Containerized** — one Docker image, one port, zero external dependencies at runtime

---

## Author

**Abdulelah Alzahrani**
Full-Stack Web Developer
GitHub: [@Abdulelahdev753](https://github.com/Abdulelahdev753)
