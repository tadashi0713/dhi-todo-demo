# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack Todo application: React + TypeScript frontend, Express + TypeScript backend, PostgreSQL database. Docker Compose orchestrates all three services.

## Commands

### Docker (recommended)
```bash
docker compose up --build        # build images and start all services
docker compose up -d             # start all services (detached)
docker compose down              # stop all services
```

> **Note:** The Dockerfiles use `COPY node_modules ./node_modules` instead of `npm install` because the network environment blocks npm registry access. Always run `npm install` locally in `backend/` and `frontend/` before building Docker images.

### Backend (local dev)
```bash
cd backend
npm install
npm run dev      # ts-node-dev with hot reload on port 3001
npm run build    # compile TypeScript to dist/
```

### Frontend (local dev)
```bash
cd frontend
npm install
npm run dev      # Vite dev server on port 5173 (proxies /api to localhost:3001)
npm run build    # production build to dist/
```

## Architecture

```
frontend (React)  →  /api/*  →  backend (Express)  →  PostgreSQL
  port 3000 (nginx)              port 3001              port 5432
```

- **frontend/src/api/todos.ts** — all fetch calls to the REST API
- **frontend/src/App.tsx** — single-page UI (add, toggle, edit, delete, filter)
- **backend/src/routes/todos.ts** — CRUD route handlers
- **backend/src/db.ts** — pg Pool and `initDB()` (creates table on startup)
- **backend/src/index.ts** — Express entry point; calls `initDB()` before listening

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

## Environment Variables

Backend reads `DATABASE_URL` (PostgreSQL connection string) and `PORT` (default `3001`).
In Docker Compose these are set automatically. For local dev, create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos
PORT=3001
```
