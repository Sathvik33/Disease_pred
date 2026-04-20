<div align="center">
  <h1>⚙️ Backend Orchestration Service</h1>
  <p><strong>The Core Orchestrator & AI Agent Engine</strong></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](#)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
</div>

## 📌 Overview

This Node.js/Express service acts as the central brain of the platform. It handles API requests from the frontend, queries the deep-learning service for inference, pulls contextual weather data from `Open-Meteo`, and drives a **LangChain ReAct Agent** that interfaces directly with local `Ollama` models. 

### ✨ Features
- **ReAct AI AgentFlow**: Dynamically correlates detected diseases, local geographical parameters (weather/forecast), and local treatment knowledge bases (38 supported classes) to synthesize human-like action plans.
- **Durable Database Persistence**: Logs diagnostic data, coordinates, and AI advisory logs to a `PostgreSQL` Database.
- **Tiered Rate Limiting**: Intelligent sliding window limiters (e.g., stricter counts on heavy LLM advisory routes).

## 🛠️ Setup & Running Locally

1. Install Dependencies:
```bash
npm install
```

2. Configure Variables (.env):
Make sure variables for the Database (`DB_HOST`, `DB_PASS`, etc) and Model inference engines (`Fast_api`, `OLLAMA_URL`) are populated.

3. Run Development Server:
```bash
npm run dev
```

## 🐳 Docker Deployment

The backend utilizes an optimized multi-stage build running on `node:20-alpine`.

```bash
docker build -t backend:latest .
docker run -p 5000:5000 --env-file ../.env backend:latest
```

## 📂 Key Architecture
- `src/agent/plantAgent.ts` - Core LangChain integration.
- `src/routes/diagnose.ts` - Entrypoint for the diagnosis generation pipeline.
- `src/data/diseases.ts` - Internal embedded knowledge base preventing DB lookups and standardizing definitions.

---
*Built by [@Sathvik33](https://github.com/Sathvik33) as part of the Disease-Prediction Platform.*
