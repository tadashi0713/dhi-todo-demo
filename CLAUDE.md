# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack Todo application: single Node.js process (Express) serving both the REST API and the Vite-built React frontend. PostgreSQL for persistence. Two Docker services: `app` + `postgres`.

## Commands

### Docker (recommended)
```bash
docker compose up --build        # build image and start all services
docker compose up -d             # start all services (detached)
docker compose down              # stop all services
```

> **Note:** The Dockerfile uses `COPY node_modules ./node_modules` instead of `npm install` because the network environment blocks npm registry access. Run `npm install` locally before building Docker images.
>
> **Note:** Next.js (SWC) cannot be used in this environment due to a CPU instruction incompatibility (`SIGILL`). Use Express + Vite instead.

### Local dev
```bash
npm install
npm run dev          # concurrently: Express (port 3001) + Vite dev server (port 5173)
npm run build        # build:client (Vite → dist/client) then build:server (tsc → dist/server)
npm start            # run production build on port 3001
```

Create `.env` in the project root for local dev:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos
```

## Architecture

```
Browser → Express (port 3001)
            ├── /api/*        → API route handlers (src/server/routes/)
            ├── /health       → health check
            └── /* (static)   → dist/client (Vite-built React app)
```

- **src/server/index.ts** — Express entry point; calls `initDB()`, mounts routes, serves static files in production
- **src/server/db.ts** — pg Pool initialized from `DATABASE_URL`; `initDB()` creates the todos table
- **src/server/routes/todos.ts** — CRUD handlers
- **src/client/App.tsx** — React UI (add, toggle, inline-edit, delete, filter)
- **vite.config.ts** — root: `src/client`, output: `dist/client`; dev proxy `/api` → `localhost:3001`
- **tsconfig.server.json** — separate TS config for the server (NodeNext modules, emits to `dist/server`)

### Database schema

```sql
CREATE TABLE todos (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/todos | list all todos |
| POST | /api/todos | create `{ title }` |
| PUT | /api/todos/:id | update `{ title?, completed? }` |
| DELETE | /api/todos/:id | delete todo |
