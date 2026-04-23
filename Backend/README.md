<div align="center">

# ⚙️ Backend — API Gateway & AI Agent

**Express 5 · TypeScript · LangGraph · PostgreSQL · JWT**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![LangChain](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)

</div>

---

## Overview

The backend is the central orchestration layer of the PlantDoc platform. It handles all client requests, enforces JWT authentication and rate limiting, proxies images to the DL inference service, and runs the **LangGraph ReAct agent** that produces the contextual treatment advisory.

---

## Request Flow

```
Frontend (React)
    │
    │  POST /api/diagnose (JWT, multipart image + lat/lon)
    ▼
Express Router → auth middleware → rate limiter
    │
    │  Forward image buffer
    ▼
DL-service  ──►  { disease, confidence, is_plant, entropy }
    │
    │  (if is_plant = true)
    ▼
LangGraph ReAct Agent  (LLaMA 3.3 70B via Groq, temp=0)
    ├── Tool: get_weather        (Open-Meteo — current + 7-day history)
    ├── Tool: search_treatment   (Tavily advanced search → local KB fallback)
    └── Tool: search_disease_info (DuckDuckGo scrape → local KB fallback)
    │
    ▼
Structured advisory text (markdown, emoji-formatted)
    │
    ▼
INSERT INTO predictions (PostgreSQL)
    │
    ▼
JSON response to frontend
```

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2 | HTTP server |
| `@langchain/langgraph` | ^1.2 | ReAct agent orchestration |
| `@langchain/groq` | ^1.2 | Groq LLM client (LLaMA 3.3 70B) |
| `@langchain/core` | ^1.1 | LangChain tool/schema primitives |
| `@tavily/core` | ^0.7 | Tavily web search |
| `duck-duck-scrape` | ^2.2 | DuckDuckGo fallback search |
| `pg` | ^8.20 | PostgreSQL client |
| `bcrypt` | ^6.0 | Password hashing |
| `jsonwebtoken` | ^9.0 | JWT sign/verify |
| `multer` | ^2.1 | Multipart image upload |
| `express-rate-limit` | ^8.3 | Sliding-window rate limiting |
| `axios` | ^1.15 | HTTP client (DL-service calls) |
| `zod` | ^4.3 | Tool schema validation |

---

## API Routes

### Public

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/health` | — | `{ status: "ok" }` |
| `POST` | `/api/register` | `{ name, email, password }` | `{ user, token }` |
| `POST` | `/api/login` | `{ email, password }` | `{ user, token }` |
| `POST` | `/api/predict` | `multipart: image` | `{ disease, confidence, is_plant, entropy }` |

### Protected (Bearer JWT)

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/me` | — | `{ id, uid, name, email, created_at }` |
| `GET` | `/api/history` | — | `{ history: [...] }` |
| `POST` | `/api/diagnose` | `multipart: image, latitude, longitude` | `{ prediction, advisory }` |

### Rate Limits

| Route | Window | Limit |
|---|---|---|
| `/api/predict` | 15 min | 30 requests |
| `/api/diagnose` | 15 min | 10 requests |

---

## Agent Tools

### `get_weather`
Fetches **current conditions + 7-day historical data** from [Open-Meteo](https://open-meteo.com) for the submitted GPS coordinates. No API key required.

Returns: temperature, humidity, precipitation, wind speed, daily max/min temps.

### `search_treatment`
Queries **Tavily** (advanced search depth, up to 5 results) for treatment recommendations, fungicide options, and precautions for the detected disease.

Falls back to the embedded local knowledge base (`src/data/diseases.ts`) if Tavily is unavailable.

### `search_disease_info`
Queries **DuckDuckGo** for disease causes, symptoms, and spread patterns.

Falls back to the embedded local knowledge base if scraping fails.

### LLM Configuration
- **Model:** `llama-3.3-70b-versatile` via Groq
- **Temperature:** `0` — deterministic, consistent output
- **Framework:** LangGraph `createReactAgent`
- **Prompt:** Forces all three tools to be called; structures output with emoji-formatted sections; adjusts confidence thresholds (>80% / 50-80% / <50%)

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    uid        UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- bcrypt hashed
    created_at TIMESTAMP DEFAULT NOW()
);

-- Predictions
CREATE TABLE predictions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    disease    VARCHAR(100) NOT NULL,
    confidence REAL NOT NULL,
    latitude   REAL,
    longitude  REAL,
    advisory   TEXT,
    ip         VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

Tables are created automatically via `initDB()` on first startup.

---

## Project Structure

```
Backend/
├── src/
│   ├── agent/
│   │   ├── plantAgent.ts     # LangGraph ReAct agent setup + prompt
│   │   └── tools.ts          # get_weather, search_treatment, search_disease_info
│   ├── routes/
│   │   ├── predict.ts        # POST /api/predict (image → DL only)
│   │   ├── diagnose.ts       # POST /api/diagnose (image → agent → DB)
│   │   └── user.ts           # register, login, me, history
│   ├── services/
│   │   ├── ml.service.ts     # Forward image to DL-service
│   │   ├── agent.service.ts  # Orchestrate predict → agent → DB insert
│   │   ├── treatment.service.ts  # Local KB lookup functions
│   │   └── user.service.ts   # DB queries for users/predictions
│   ├── middleware/
│   │   ├── auth.ts           # JWT verify middleware + signToken
│   │   └── limiter.ts        # express-rate-limit instances
│   ├── data/
│   │   └── diseases.ts       # Embedded knowledge base (38 disease entries)
│   ├── db.ts                 # pg.Pool configuration
│   ├── schema.ts             # Table creation on startup
│   └── index.ts              # App entry — dotenv, middleware, routes, listen
├── dockerfile                # Multi-stage: builder → deps → alpine runner
├── .dockerignore
├── package.json
└── tsconfig.json
```

---

## Local Development

```bash
# Prerequisites: Node.js 20+, PostgreSQL running locally

cd Backend
npm install
npm run dev
# → server running on :5000
# → DB connected
```

The dev server (`ts-node-dev`) hot-reloads on file changes and reads env from the root `../.env`.

### Environment Variables (read from root `../.env`)

| Variable | Local default | Production |
|---|---|---|
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | `http://dl-service:8000` (auto-set by compose) |
| `DB_HOST` | `localhost` | `postgres` (auto-set by compose) |
| `DB_PORT` | `5432` | `5432` |
| `DB_USER` | `postgres` | from `.env.production` |
| `DB_PASS` | your local password | from `.env.production` |
| `DB_NAME` | `Disease-Prediction` | from `.env.production` |
| `JWT_SECRET` | any string | strong random from `.env.production` |
| `GROQ_API_KEY` | your key | from `.env.production` |
| `TAVILY_API_KEY` | your key | from `.env.production` |

---

## Docker

```bash
# From the repo root
docker compose --env-file .env.production build backend
docker compose --env-file .env.production up backend -d

# Logs
docker compose logs backend --follow
```

The Dockerfile uses a **3-stage build**:
1. **builder** — installs all deps, compiles TypeScript → `dist/`
2. **deps** — installs production-only `node_modules`
3. **runner** — `node:20-alpine`, non-root user, copies only `dist/` + `node_modules/`

Estimated image size: **~180 MB**

---

*Part of the [PlantDoc](../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*
