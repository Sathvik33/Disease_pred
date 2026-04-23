<div align="center">

# PlantDoc — AI Plant Disease Diagnosis Platform

**Upload a leaf photo. Get an instant diagnosis, weather-aware treatment plan, and actionable farming advice — powered by computer vision and a multi-tool LLM agent.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)](#)

</div>

---

## What is PlantDoc?

PlantDoc is a production-grade, full-stack AI system that lets farmers, agronomists, and gardeners diagnose plant diseases in seconds. It goes far beyond simple image classification by integrating an LLM agent that provides actionable treatment advice.

### Features
- **Instant Diagnosis**: Fast ONNX model inference deployed via FastAPI.
- **Agentic Advice**: Integrates Groq and Tavily for accurate, contextual, and up-to-date treatment plans.
- **Secure Architecture**: Robust backend in Node.js/Express with Postgres for user management.
- **Modern UI**: Sleek, responsive React frontend.

---

## 🏗 System Architecture

The application is split into three main components:

1. **Frontend (Vercel)**
   - Built with React, Vite, and TailwindCSS.
   - Deployed seamlessly on Vercel for fast edge delivery.
   - Live URL: [PlantDoc App](https://disease-pred-eight.vercel.app/)

2. **Backend Node.js API (Docker)**
   - Express server handling authentication, user sessions, and routing requests to the ML service.
   - Connects to PostgreSQL database for persistent storage.

3. **DL-Service / ML API (Docker)**
   - FastAPI Python backend running ONNX models for high-performance plant disease classification.
   - Strictly internal microservice (not exposed to the public internet).

---

## 🚀 Deployment & Containerization

The backend services are fully containerized using multi-stage Docker builds. You can easily run the entire backend infrastructure locally or on a VPS (like Render, AWS EC2, or DigitalOcean) using Docker Compose.

### Prerequisites
- Docker and Docker Compose
- Node.js (for local dev)
- Python 3.11 (for local dev)

### Environment Variables

Before starting, ensure you have your `.env` (or `.env.production`) file properly configured at the root directory:

```env
FRONTEND_URL=https://disease-pred-eight.vercel.app/

DB_USER=postgres
DB_PASS=your_db_password
DB_NAME=Disease-Prediction
DB_PORT=5432

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```
> **Security Warning:** Never commit your actual `.env.production` file containing real API keys to version control. They are currently ignored via `.gitignore` to prevent secret leaks.

### Running the Services

To spin up the PostgreSQL database, Node.js Backend, and the FastAPI ML Service:

```bash
docker-compose up --build -d
```

- **Backend** will be available at: `http://localhost:5000`
- **ML Service** runs internally at: `http://dl-service:8000` (accessible to the Backend)
- **Database** runs internally at port `5432`

---

## 📂 Project Structure

```text
Disease-pred/
├── Backend/          # Node.js + Express API
├── DL-service/       # FastAPI + Python ONNX Inference
├── Frontend/         # React + Vite Application
├── docker-compose.yaml
└── README.md
```

## 🔒 Security & CORS

The backend is configured with strict CORS policies, only allowing requests from the production Vercel frontend URL (`https://disease-pred-eight.vercel.app/`) and local development URLs.
