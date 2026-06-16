# CoreMotion — single-image build: Express serves the static Next.js frontend
# plus the /api routes on one port.

# ---- Stage 1: build the static frontend (Next.js output: "export") ----
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Build at the site root (no NEXT_PUBLIC_BASE_PATH) so assets resolve from "/".
RUN npm run build

# ---- Stage 2: compile the backend (tsc -> dist) ----
FROM node:24-slim AS backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:24-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Backend production dependencies only
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci --omit=dev

# Compiled backend + exported frontend
COPY --from=backend /app/backend/dist ./backend/dist
COPY --from=frontend /app/frontend/out ./frontend/out

ENV FRONTEND_DIR=/app/frontend/out
ENV PORT=3000
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
