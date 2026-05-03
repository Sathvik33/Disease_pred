<div align="center">

# 🌿 PlantDoc — AI-Powered Plant Disease Diagnosis Platform

**Upload a leaf photo → get an instant disease diagnosis, real-time weather-aware treatment plan, and actionable farming advice — powered by deep learning and a multi-tool LLM agent.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-disease--pred--eight.vercel.app-34d399?style=for-the-badge)](https://disease-pred-eight.vercel.app)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#tech-stack)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#tech-stack)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#tech-stack)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](#tech-stack)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#tech-stack)
[![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)](#tech-stack)
[![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](#deployment)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](#cicd-pipeline)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#option-1-local-development)
  - [Docker Compose](#option-2-docker-compose-recommended)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Model Details](#-model-details)
- [Security](#-security)
- [Service READMEs](#-service-readmes)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

PlantDoc is a **production-grade, full-stack AI platform** that enables farmers, agronomists, and gardeners to diagnose plant diseases in seconds. Unlike simple image classifiers, PlantDoc integrates a **LangGraph ReAct agent** that cross-references the model's prediction with live weather data and curated treatment databases to produce actionable, context-aware advisories.

### How It Works

1. **User uploads** a leaf image (drag-and-drop, file picker, or live camera capture)
2. **GPS coordinates** are captured automatically or entered manually
3. **ONNX model** classifies the leaf across 38 disease classes (14 plant species)
4. **Non-plant filter** validates the image using confidence, entropy, and green-dominance analysis
5. **LLM agent** (LLaMA 3.3 70B via Groq) orchestrates three tools — weather, treatment search, disease lookup
6. **Structured advisory** is returned with immediate actions, treatment plan, and prevention steps
7. **Prediction is saved** to PostgreSQL for the user's diagnosis history

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **38-Class Disease Detection** | ONNX-exported MobileNet fine-tuned on PlantVillage — covers 14 plant species |
| **Agentic Advisory System** | LangGraph ReAct agent with weather, web search, and knowledge base tools |
| **Non-Plant Image Rejection** | Three-gate filter: confidence threshold, Shannon entropy, green-pixel dominance |
| **Real-Time Weather Analysis** | Open-Meteo integration (current conditions + 7-day historical) — no API key needed |
| **Dual Search Strategy** | Tavily (primary) + DuckDuckGo (fallback) → embedded knowledge base (last resort) |
| **JWT Authentication** | Secure user registration, login, and session management with bcrypt hashing |
| **Prediction History** | Full audit trail with disease, confidence, GPS, and advisory text |
| **Live Camera Capture** | Back-facing camera via `getUserMedia` with JPEG snapshot |
| **Geolocation Support** | Browser GPS with granular error handling and manual coordinate input |
| **Rate Limiting** | Sliding-window limits: 30 predictions / 10 diagnoses per 15-minute window |
| **Containerized Deployment** | Multi-stage Docker builds for all services with health checks |
| **CI/CD Pipeline** | GitHub Actions → ECR → EC2 automated deployment |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                               │
│                                                                         │
│  React 19 SPA · Vite 8 · TypeScript · Custom CSS Design System         │
│  - Image upload / Camera capture / GPS geolocation                     │
│  - JWT auth with auto-refresh on 401                                   │
│  Deployed: Vercel (edge CDN)                                           │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │  HTTPS (REST API)
                             │  Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js / Express 5)                       │
│                                                                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────────────────────────┐  │
│  │  Auth   │  │  Rate    │  │         Route Handlers                │  │
│  │Middleware│→ │ Limiter  │→ │  /predict  /diagnose  /user/*        │  │
│  └─────────┘  └──────────┘  └───────────────┬───────────────────────┘  │
│                                              │                          │
│  ┌───────────────────────────────────────────┴──────────────────────┐   │
│  │              LangGraph ReAct Agent (LLaMA 3.3 70B)              │   │
│  │                                                                  │   │
│  │  ┌──────────────┐ ┌──────────────────┐ ┌────────────────────┐   │   │
│  │  │ get_weather   │ │ search_treatment │ │ search_disease_info│   │   │
│  │  │ (Open-Meteo)  │ │ (Tavily → KB)    │ │ (DDG → KB)         │   │   │
│  │  └──────────────┘ └──────────────────┘ └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Deployed: Docker on AWS EC2 (port 5000)                               │
└────────────────┬────────────────────────────────────┬───────────────────┘
                 │                                    │
                 │  HTTP (internal Docker network)    │  TCP 5432
                 ▼                                    ▼
┌────────────────────────────┐       ┌────────────────────────────────────┐
│  DL-SERVICE (FastAPI)      │       │  PostgreSQL 15                     │
│                            │       │                                    │
│  ONNX Runtime · MobileNet  │       │  Tables: users, predictions        │
│  38-class classification   │       │  pgcrypto UUID generation          │
│  Non-plant image filtering │       │  Auto-migration on startup         │
│                            │       │                                    │
│  Deployed: Docker (8000)   │       │  Deployed: RDS / Docker (5432)     │
└────────────────────────────┘       └────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2 | UI framework |
| TypeScript | ~6.0 | Type safety |
| Vite | ^8.0 | Build tool & dev server |
| React Router | ^7.14 | Client-side routing |
| Axios | ^1.15 | HTTP client with interceptors |
| Custom CSS | — | Hand-crafted design system (no Tailwind/MUI) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | ^5.2 | HTTP server |
| LangGraph | ^1.2 | ReAct agent orchestration |
| Groq SDK | ^1.2 | LLaMA 3.3 70B inference |
| Tavily | ^0.7 | Web search tool |
| PostgreSQL (pg) | ^8.20 | Database client |
| bcrypt | ^6.0 | Password hashing (10 rounds) |
| jsonwebtoken | ^9.0 | JWT auth (7-day expiry) |
| express-rate-limit | ^8.3 | Sliding-window rate limiting |
| Zod | ^4.3 | Runtime schema validation |

### DL-Service
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | ASGI web framework |
| ONNX Runtime | latest | CPU model inference |
| Pillow | latest | Image processing |
| NumPy | latest | Array operations & softmax |
| Uvicorn | latest | ASGI server |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Container orchestration |
| Nginx | Reverse proxy + static file server |
| GitHub Actions | CI/CD pipeline |
| AWS ECR | Container registry |
| AWS EC2 | Backend & DL-service hosting |
| AWS RDS | Managed PostgreSQL |
| Vercel | Frontend edge deployment |

---

## 📂 Project Structure

```
Disease-pred/
├── Backend/                          # Node.js API + LangGraph Agent
│   ├── src/
│   │   ├── agent/
│   │   │   ├── plantAgent.ts         # ReAct agent setup + structured prompt
│   │   │   └── tools.ts              # Weather, treatment search, disease search tools
│   │   ├── routes/
│   │   │   ├── predict.ts            # POST /api/predict  (image → DL only)
│   │   │   ├── diagnose.ts           # POST /api/diagnose (image → agent → DB)
│   │   │   └── user.ts              # Register, login, me, history
│   │   ├── services/
│   │   │   ├── ml.service.ts         # Forward image to DL-service via HTTP
│   │   │   ├── agent.service.ts      # Orchestrate: predict → agent → DB insert
│   │   │   ├── treatment.service.ts  # Local knowledge base lookup
│   │   │   └── user.service.ts       # User CRUD + password hashing
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verify + signToken helper
│   │   │   └── limiter.ts            # Rate limit instances
│   │   ├── data/
│   │   │   └── diseases.ts           # Embedded KB: 38 diseases with treatments
│   │   ├── db.ts                     # PostgreSQL pool configuration
│   │   ├── schema.ts                 # Auto-migration: CREATE TABLE IF NOT EXISTS
│   │   └── index.ts                  # Express app entry point
│   ├── dockerfile                    # Multi-stage: builder → deps → runner
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                     # ← Detailed backend documentation
│
├── DL-service/                       # Python ONNX Inference Microservice
│   ├── app/
│   │   ├── main.py                   # FastAPI app + /predict endpoint
│   │   ├── model_loader.py           # ONNX session loaded once at startup
│   │   └── utils.py                  # Image preprocessing pipeline
│   ├── model/
│   │   ├── best_model.onnx           # Trained MobileNet weights (~11 MB)
│   │   └── class_names.json          # 38-class label mapping
│   ├── dockerfile                    # Multi-stage: builder → runner
│   ├── requirements.txt
│   └── README.md                     # ← Detailed DL-service documentation
│
├── Frontend/
│   └── Disease-Predition/            # React SPA
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Auth.tsx           # Login / Register with JWT
│       │   │   ├── Dashboard.tsx      # Core diagnosis UI (upload + camera + results)
│       │   │   ├── History.tsx        # Past diagnoses with advisory modal
│       │   │   └── Profile.tsx        # User account details
│       │   ├── components/
│       │   │   └── Layout.tsx         # Sidebar navigation + <Outlet/>
│       │   ├── api.ts                 # Axios instance + interceptors
│       │   ├── App.tsx                # Router + ProtectedRoute (server validation)
│       │   ├── index.css              # Full design system (dark theme, CSS vars)
│       │   └── main.tsx               # React 19 createRoot entry
│       ├── nginx.conf                 # Production reverse proxy config
│       ├── dockerfile                 # Multi-stage: Vite build → nginx:alpine
│       ├── vercel.json                # SPA rewrite rules for Vercel
│       ├── vite.config.ts
│       ├── package.json
│       └── README.md                  # ← Detailed frontend documentation
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD: Build → ECR → EC2 deploy
│
├── docker-compose.yaml                # Full-stack orchestration
├── .env.production                    # Production env template (gitignored values)
├── .gitignore
├── .dockerignore
└── README.md                          # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required For |
|---|---|---|
| **Docker** + Docker Compose | 20.10+ | Running all services |
| **Node.js** | 20+ | Backend local dev |
| **Python** | 3.11+ | DL-service local dev |
| **PostgreSQL** | 15+ | Database (local dev only) |

### Environment Variables

Create a `.env.production` file at the project root:

```env
# ─── Frontend ───────────────────────────────────────
FRONTEND_URL=https://your-frontend-url.vercel.app

# ─── Database ───────────────────────────────────────
DB_USER=postgres
DB_PASS=your_secure_password
DB_NAME=plantdb
DB_PORT=5432
DB_HOST=localhost                    # or RDS endpoint for production

# ─── Authentication ─────────────────────────────────
JWT_SECRET=your_random_256bit_secret

# ─── AI / LLM Agent ────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key
TAVILY_API_KEY=tvly-your_tavily_key
```

> [!CAUTION]
> **Never commit `.env.production` with real secrets.** The `.gitignore` is configured to exclude all `.env.*` files. Use a secrets manager (AWS SSM, GitHub Secrets) in production.

---

### Option 1: Local Development

Run each service in a separate terminal:

```bash
# Terminal 1 — DL-Service (Python)
cd DL-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Backend (Node.js)
cd Backend
npm install
npm run dev
# → Express server on :5000, hot-reloading via ts-node-dev

# Terminal 3 — Frontend (React)
cd Frontend/Disease-Predition
npm install
npm run dev
# → Vite dev server on :3000, proxying /api to :5000
```

> [!TIP]
> The Vite dev server proxies all `/api/*` requests to `localhost:5000` automatically. No CORS issues, no `VITE_API_URL` needed locally.

---

### Option 2: Docker Compose (Recommended)

Spin up the entire backend stack with a single command:

```bash
docker compose --env-file .env.production up --build -d
```

| Service | Internal URL | External Port | Health Check |
|---|---|---|---|
| **PostgreSQL** | `postgres:5432` | — (internal only) | `pg_isready` |
| **DL-Service** | `dl-service:8000` | — (internal only) | `GET /` |
| **Backend** | `backend:5000` | `5000` | `GET /health` |

```bash
# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

> [!NOTE]
> The Frontend is deployed separately on Vercel. To run it locally alongside Docker Compose, set `VITE_API_URL=http://localhost:5000` in `Frontend/Disease-Predition/.env.local` and run `npm run dev`.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment to AWS.

```
Push to main
    │
    ├── Checkout code
    ├── Configure AWS credentials (via GitHub Secrets)
    ├── Login to AWS ECR
    │
    ├── Build Backend Docker image
    ├── Tag + Push to ECR (plant-backend:latest)
    │
    ├── Build DL-Service Docker image
    ├── Tag + Push to ECR (plant-dl-service:latest)
    │
    └── SSH into EC2
        ├── Pull latest images from ECR
        ├── Stop existing containers
        └── Start new containers with .env.production
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `EC2_HOST` | EC2 instance public IP |
| `EC2_USER` | SSH username (e.g., `ec2-user`) |
| `EC2_KEY` | SSH private key (PEM format) |

---

## ☁️ Deployment

### Current Production Architecture

| Component | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [disease-pred-eight.vercel.app](https://disease-pred-eight.vercel.app) |
| **Backend** | AWS EC2 (Docker) | `http://<EC2-IP>:5000` |
| **DL-Service** | AWS EC2 (Docker) | Internal only (`dl-service:8000`) |
| **Database** | AWS RDS (PostgreSQL 15) | Internal only |

### Docker Image Sizes

| Image | Base | Estimated Size |
|---|---|---|
| Backend | `node:20-alpine` | ~180 MB |
| DL-Service | `python:3.11-slim` | ~550 MB |
| Frontend | `nginx:1.27-alpine` | ~25 MB |

---

## 📡 API Reference

### Public Endpoints

| Method | Path | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/health` | Health check | — |
| `POST` | `/api/register` | Create account | — |
| `POST` | `/api/login` | Sign in, get JWT | — |
| `POST` | `/api/predict` | Image classification only | 30/15min |

### Protected Endpoints (Bearer JWT)

| Method | Path | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/me` | Current user profile | — |
| `GET` | `/api/history` | Prediction history | — |
| `POST` | `/api/diagnose` | Full diagnosis (ML + Agent + DB) | 10/15min |

### Example: Full Diagnosis

```bash
curl -X POST https://your-api.com/api/diagnose \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@leaf_photo.jpg" \
  -F "latitude=28.7041" \
  -F "longitude=77.1025"
```

**Response:**

```json
{
  "prediction": {
    "disease": "Tomato___Late_blight",
    "confidence": 0.9412,
    "is_plant": true
  },
  "advisory": "🚨 **Immediate Actions (Do this first)**\n1. Remove all infected leaves immediately...\n\n🌿 **Disease Summary**\n- Late Blight caused by Phytophthora infestans...\n\n🌦 **Weather Impact Analysis**\n- Current humidity at 89% strongly favors disease spread...\n\n💊 **Treatment Plan**\n- Chemical: Metalaxyl-M + Mancozeb\n- Organic: Copper hydroxide\n\n🛡 **Prevention (Next 7–14 days)**\n- Monitor weather forecasts...\n\n⚠️ **Confidence Note**\n- At 94.1% confidence, this prediction is highly reliable."
}
```

---

## 🧠 Model Details

| Property | Value |
|---|---|
| **Architecture** | MobileNet (fine-tuned) |
| **Export Format** | ONNX (`best_model.onnx`, ~11 MB) |
| **Runtime** | ONNX Runtime — CPUExecutionProvider |
| **Input** | 224×224 RGB, ImageNet-normalized |
| **Output** | Softmax probabilities over 38 classes |
| **Training Data** | PlantVillage Dataset (Augmented) |
| **Experiment Tracking** | Weights & Biases (W&B) |

### Supported Plants & Diseases (38 Classes)

| Plant | Diseases Detected |
|---|---|
| **Apple** | Apple Scab, Black Rot, Cedar Apple Rust, Healthy |
| **Blueberry** | Healthy |
| **Cherry** | Powdery Mildew, Healthy |
| **Corn** | Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy |
| **Grape** | Black Rot, Esca (Black Measles), Leaf Blight, Healthy |
| **Orange** | Huanglongbing (Citrus Greening) |
| **Peach** | Bacterial Spot, Healthy |
| **Pepper** | Bacterial Spot, Healthy |
| **Potato** | Early Blight, Late Blight, Healthy |
| **Raspberry** | Healthy |
| **Soybean** | Healthy |
| **Squash** | Powdery Mildew |
| **Strawberry** | Leaf Scorch, Healthy |
| **Tomato** | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |

### Non-Plant Image Filter

The DL-service rejects non-leaf images using a three-gate filter:

```
is_plant = confidence > 0.55
        AND normalized_entropy < 0.50
        AND green_pixel_dominance > 0.12
```

If `is_plant = false`, the backend returns an error immediately — the LLM agent is never invoked, saving API quota and latency.

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Authentication** | JWT (HS256, 7-day expiry) with bcrypt password hashing (10 rounds) |
| **CORS** | Strict origin allowlist — production Vercel URL + localhost variants |
| **Rate Limiting** | Sliding-window via `express-rate-limit` (30 predict / 10 diagnose per 15 min) |
| **SQL Injection** | Parameterized queries via `pg` driver — no string interpolation |
| **Container Security** | Non-root users (`appuser`) in all Docker images |
| **Network Isolation** | DL-service + PostgreSQL on internal Docker network — never publicly exposed |
| **Health Checks** | Docker HEALTHCHECK on every container for automated recovery |
| **HTTPS** | TLS termination at Vercel (frontend) and can be configured at load balancer (backend) |
| **Headers** | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy (via Nginx) |

---

## 📖 Service READMEs

Each service has its own comprehensive README with architecture details, API documentation, and development guides:

| Service | README | Description |
|---|---|---|
| **Backend** | [`Backend/README.md`](./Backend/README.md) | Express API, LangGraph agent, database schema, tool docs |
| **DL-Service** | [`DL-service/README.md`](./DL-service/README.md) | ONNX inference, preprocessing pipeline, model details |
| **Frontend** | [`Frontend/Disease-Predition/README.md`](./Frontend/Disease-Predition/README.md) | React SPA, design system, Nginx config, Vercel deployment |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing TypeScript/Python code style
- Add appropriate error handling for all new endpoints
- Update the relevant `README.md` when adding features
- Test locally with Docker Compose before submitting

---

## 📄 License

This project is licensed under the **ISC License**. See individual `package.json` files for details.

---

<div align="center">

**Built with ❤️ by [@Sathvik33](https://github.com/Sathvik33)**

[⬆ Back to Top](#-plantdoc--ai-powered-plant-disease-diagnosis-platform)

</div>
