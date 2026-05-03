<div align="center">

# ⚙️ Backend — API Gateway & AI Agent

**Express 5 · TypeScript · LangGraph ReAct Agent · PostgreSQL · JWT Authentication**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![LangChain](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)](#)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Request Flow](#-request-flow)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Agent Architecture](#-agent-architecture)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Docker](#-docker)
- [Environment Variables](#-environment-variables)

---

## Overview

The Backend is the **central orchestration layer** of the PlantDoc platform. It is responsible for:

- **Authenticating users** via JWT (register, login, token validation)
- **Rate-limiting requests** to protect downstream services
- **Proxying images** to the DL-service for ONNX inference
- **Running the LangGraph ReAct agent** that produces weather-aware, context-rich treatment advisories
- **Persisting predictions** to PostgreSQL for user history
- **Serving as the single public API** — all other services (DL-service, PostgreSQL) are internal-only

---

## 🔄 Request Flow

The full `/api/diagnose` request lifecycle:

```
Client (React SPA)
    │
    │  POST /api/diagnose
    │  Headers: Authorization: Bearer <JWT>
    │  Body: multipart/form-data { image, latitude, longitude }
    ▼
┌─────────────────────────────────────────────────────┐
│  Express Router                                      │
│                                                      │
│  1. auth middleware    → verify JWT, extract userId   │
│  2. diagnoseLimiter   → 10 req / 15 min per IP       │
│  3. multer            → parse multipart image         │
│  4. diagnose handler  → call agent.service            │
└──────────────────────────┬──────────────────────────-┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│  agent.service.ts                                     │
│                                                       │
│  Step 1: predictDisease(file)                         │
│           → Forward image buffer to DL-service        │
│           → Receive: { disease, confidence,           │
│                         is_plant, entropy }            │
│                                                       │
│  Step 2: if (!is_plant) → return error immediately    │
│           No LLM call, no DB insert, no latency       │
│                                                       │
│  Step 3: runAgent(disease, confidence, lat, lon)      │
│           → LangGraph ReAct agent invocation          │
│           → Tool calls: weather, treatment, disease   │
│           → Return structured markdown advisory       │
│                                                       │
│  Step 4: INSERT INTO predictions (non-fatal)          │
│           → Save disease, confidence, GPS, advisory   │
│           → If DB fails, still return result           │
│                                                       │
│  Step 5: Return JSON { prediction, advisory }         │
└──────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2 | HTTP server (latest v5 with native Promises) |
| `@langchain/langgraph` | ^1.2 | ReAct agent orchestration framework |
| `@langchain/groq` | ^1.2 | Groq LLM client — LLaMA 3.3 70B Versatile |
| `@langchain/core` | ^1.1 | LangChain tool/schema primitives |
| `@tavily/core` | ^0.7 | Tavily web search (advanced depth) |
| `duck-duck-scrape` | ^2.2 | DuckDuckGo scraping (fallback search) |
| `pg` | ^8.20 | PostgreSQL client (parameterized queries) |
| `bcrypt` | ^6.0 | Password hashing (10 salt rounds) |
| `jsonwebtoken` | ^9.0 | JWT sign/verify (HS256, 7-day expiry) |
| `multer` | ^2.1 | Multipart file upload parsing |
| `express-rate-limit` | ^8.3 | Sliding-window rate limiting |
| `axios` | ^1.15 | HTTP client for DL-service calls |
| `form-data` | ^4.0 | Multipart form builder for service-to-service |
| `zod` | ^4.3 | Runtime schema validation for tool inputs |
| `dotenv` | ^17.4 | Environment variable loading |
| `cors` | ^2.8 | Cross-origin request handling |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `typescript` ^6.0 | TypeScript compiler |
| `ts-node-dev` ^2.0 | Hot-reloading dev server |
| `@types/*` | Type definitions for Node, Express, pg, bcrypt, etc. |

---

## 📡 API Reference

### Public Endpoints

| Method | Path | Body | Response | Rate Limit |
|---|---|---|---|---|
| `GET` | `/health` | — | `{ status: "ok" }` | — |
| `GET` | `/` | — | `"Disease Prediction API"` | — |
| `POST` | `/api/register` | `{ name, email, password }` | `{ user, token }` | — |
| `POST` | `/api/login` | `{ email, password }` | `{ user, token }` | — |
| `POST` | `/api/predict` | `multipart: image` | `{ disease, confidence, is_plant, entropy }` | 30/15min |

### Protected Endpoints (Requires `Authorization: Bearer <JWT>`)

| Method | Path | Body | Response | Rate Limit |
|---|---|---|---|---|
| `GET` | `/api/me` | — | `{ id, uid, name, email, created_at }` | — |
| `GET` | `/api/history` | — | `{ history: [{ id, disease, confidence, latitude, longitude, advisory, created_at }] }` | — |
| `POST` | `/api/diagnose` | `multipart: image, latitude, longitude` | `{ prediction: { disease, confidence, is_plant }, advisory }` | 10/15min |

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `400` | Missing required fields | `{ error: "message" }` |
| `401` | Missing/invalid JWT | `{ error: "token required" }` or `{ error: "invalid token" }` |
| `409` | Duplicate email on register | `{ error: "email already exists" }` |
| `429` | Rate limit exceeded | `{ error: "too many requests, try again later" }` |
| `500` | Internal server error | `{ error: "message" }` |

### Rate Limiting Configuration

| Route | Window | Max Requests | Headers |
|---|---|---|---|
| `/api/predict` | 15 minutes | 30 | `draft-8` standard |
| `/api/diagnose` | 15 minutes | 10 | `draft-8` standard |

---

## 🤖 Agent Architecture

The backend integrates a **LangGraph ReAct agent** powered by **LLaMA 3.3 70B Versatile** (via Groq, temperature=0 for deterministic output).

### Agent Tools

#### 1. `get_weather` — Real-Time Weather Data

| Property | Detail |
|---|---|
| **API** | [Open-Meteo](https://open-meteo.com) (free, no API key) |
| **Current data** | Temperature, humidity, precipitation, wind speed |
| **Historical data** | Past 7 days: daily max/min temps, precipitation |
| **Input** | `{ latitude: number, longitude: number }` |

#### 2. `search_treatment` — Treatment Recommendations

| Property | Detail |
|---|---|
| **Primary** | Tavily web search (advanced depth, 5 results, includes answer) |
| **Fallback** | Embedded knowledge base (`src/data/diseases.ts`) |
| **Data** | Chemical treatments, organic options, cultural practices, precautions |
| **Input** | `{ query: string, disease?: string }` |

#### 3. `search_disease_info` — Disease Information

| Property | Detail |
|---|---|
| **Primary** | DuckDuckGo scraping (top 5 results) |
| **Fallback** | Embedded knowledge base (`src/data/diseases.ts`) |
| **Data** | Causes, symptoms, severity, favorable conditions |
| **Input** | `{ query: string, disease?: string }` |

### Embedded Knowledge Base

The `src/data/diseases.ts` file contains a comprehensive local database covering all 38 disease classes. Each entry includes:

- Plant name and disease name
- Description, causes, and symptoms
- Severity level (none / moderate / high / critical)
- Favorable environmental conditions
- Chemical, organic, and cultural treatments
- Precautionary measures

This ensures the agent always has fallback data, even when web search APIs are unavailable.

### Prompt Engineering

The agent prompt enforces:
- **Tool usage**: All three tools must be called — no assumptions
- **Confidence-based reasoning**: >80% → direct advice, 50-80% → suggest confirmation, <50% → warn about misclassification
- **Structured output**: Emoji-formatted sections (🚨 Immediate Actions, 🌿 Disease Summary, 🌦 Weather Impact, 💊 Treatment Plan, 🛡 Prevention, ⚠️ Confidence Note)
- **Practical tone**: Field advisor, not academic — farmers need actionable steps

---

## 🗄 Database Schema

Tables are created automatically via `initDB()` on server startup. The schema migration is idempotent (uses `CREATE TABLE IF NOT EXISTS` + column existence checks).

```sql
-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    uid        UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- bcrypt hashed (10 rounds)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    disease    VARCHAR(100) NOT NULL,
    confidence REAL NOT NULL,
    latitude   REAL,
    longitude  REAL,
    advisory   TEXT,                            -- full agent-generated markdown
    ip         VARCHAR(45),                     -- client IP for audit
    created_at TIMESTAMP DEFAULT NOW()
);
```

> [!NOTE]
> The schema includes safe migration logic — if `uid`, `password`, or `user_id` columns are missing from an older schema version, they are added via `ALTER TABLE`. This allows zero-downtime upgrades.

---

## 📂 Project Structure

```
Backend/
├── src/
│   ├── agent/
│   │   ├── plantAgent.ts         # LangGraph ReAct agent config + structured prompt
│   │   └── tools.ts              # 3 tools: weather, treatment search, disease search
│   ├── routes/
│   │   ├── predict.ts            # POST /api/predict  → ML only (no auth, rate-limited)
│   │   ├── diagnose.ts           # POST /api/diagnose → full pipeline (auth + rate-limited)
│   │   └── user.ts               # POST register/login, GET me/history
│   ├── services/
│   │   ├── ml.service.ts         # HTTP proxy: image buffer → DL-service → prediction
│   │   ├── agent.service.ts      # Orchestrator: predict → is_plant check → agent → DB
│   │   ├── treatment.service.ts  # Local KB lookup: lookupTreatment(), lookupDisease()
│   │   └── user.service.ts       # User CRUD: createUser, loginUser, getUserById, getHistory
│   ├── middleware/
│   │   ├── auth.ts               # JWT verify middleware + signToken() helper
│   │   └── limiter.ts            # apiLimiter (30/15min) + diagnoseLimiter (10/15min)
│   ├── data/
│   │   └── diseases.ts           # 38-entry embedded knowledge base with full treatment data
│   ├── db.ts                     # pg.Pool with SSL (rejectUnauthorized: false for RDS)
│   ├── schema.ts                 # Auto-migration: CREATE TABLE + ALTER TABLE if needed
│   └── index.ts                  # App entry: dotenv → CORS → routes → initDB → listen
├── dockerfile                    # 3-stage build: builder → deps → alpine runner
├── .dockerignore                 # Excludes node_modules, .env, logs, etc.
├── package.json                  # Scripts: dev, build, start
├── tsconfig.json                 # strict, nodenext, es2020, sourceMap
└── README.md                     # ← You are here
```

---

## 💻 Local Development

### Prerequisites

- **Node.js 20+** with npm
- **PostgreSQL 15+** running locally (or use Docker Compose from root)
- **DL-service running** on `localhost:8000`

### Setup

```bash
cd Backend
npm install
npm run dev
# → server running on :5000
# → DB connected
```

The dev server (`ts-node-dev`) hot-reloads on file changes. Environment variables are read from the root `../.env.production` or via `dotenv.config()`.

### Build & Run Production Locally

```bash
npm run build    # tsc → /dist
npm start        # node dist/index.js
```

---

## 🐳 Docker

### Build & Run

```bash
# From repo root (recommended)
docker compose --env-file .env.production build backend
docker compose --env-file .env.production up backend -d

# View logs
docker compose logs backend --follow

# Or standalone
cd Backend
docker build -t plant-backend:latest .
docker run -p 5000:5000 --env-file ../.env.production plant-backend:latest
```

### Multi-Stage Build

The Dockerfile uses a **3-stage build** for minimal image size:

| Stage | Base | Purpose |
|---|---|---|
| `builder` | `node:20-alpine` | Install all deps + compile TypeScript → `dist/` |
| `deps` | `node:20-alpine` | Install production-only `node_modules` (`--omit=dev`) |
| `runner` | `node:20-alpine` | Non-root user + `dist/` + `node_modules/` only |

**Security:**
- Runs as non-root user (`appuser:appgroup`)
- Production-only dependencies (no dev tools in final image)
- Health check: `wget -qO- http://localhost:5000/health`

**Estimated image size: ~180 MB**

---

## 🔧 Environment Variables

| Variable | Local Default | Production | Description |
|---|---|---|---|
| `ML_SERVICE_URL` | `http://localhost:8000` | `http://dl-service:8000` (set by compose) | DL-service inference endpoint |
| `DB_HOST` | `localhost` | RDS endpoint or `postgres` (compose) | PostgreSQL host |
| `DB_PORT` | `5432` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | From `.env.production` | Database username |
| `DB_PASS` | your password | From `.env.production` | Database password |
| `DB_NAME` | `plantdb` | From `.env.production` | Database name |
| `JWT_SECRET` | any string | Strong random (256-bit) | JWT signing secret |
| `GROQ_API_KEY` | your key | From `.env.production` | Groq API key for LLaMA |
| `TAVILY_API_KEY` | your key | From `.env.production` | Tavily search API key |
| `FRONTEND_URL` | `http://localhost:3000` | Vercel URL | CORS allowed origin |
| `PORT` | `5000` | `5000` | Express listen port |
| `NODE_ENV` | `development` | `production` | Environment mode |

---

<div align="center">

*Part of the [PlantDoc](../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*

</div>
