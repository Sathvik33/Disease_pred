<div align="center">
  <h1>🌱 Disease Prediction Application</h1>
  <p><strong>A Next-Gen AI-Powered Platform for Plant Disease Identification & Treatment Advice</strong></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](#)
  [![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](#)
  
  <br />
</div>

## 📖 Overview

The **Disease Prediction Application** is a full-stack, distributed microservices AI system. It enables farmers, gardeners, and agronomists to simply snap a picture of a leaf and receive an instant, accurate disease diagnosis. 

Going beyond mere classification, the system leverages a **ReAct AI Agent** (powered by LangChain & Ollama) hooked up to local treatment data and Open-Meteo weather APIs to provide context-aware, hyper-personalized treatment recommendations.

## 🏗️ Architecture

The project is structured into three main microservices:

1. **[Frontend (Vite + React) ](./Frontend/Disease-Predition)**
   - The user interface where users upload leaf images and coordinates.
2. **[Backend (Node.js + Express) ](./Backend)**
   - The orchestration layer. It handles rate limiting, database persistence, and hosts the LangChain Agent that integrates weather APIs and the Knowledge Base to generate comprehensive advice.
3. **[DL-Service (FastAPI + PyTorch) ](./DL-service)**
   - The deep learning microservice. It runs a fine-tuned MobileNetV2 model to classify an image into one of 38 disease categories instantly.

## 🚀 Quick Start (Docker)

This application is fully Dockerized using highly optimized **Multi-Stage Builds**.

Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed. (If you don't use Docker Compose, you can build each individually).

1. Clone the repository:
```bash
git clone https://github.com/Sathvik33/Disease-Prediction.git
cd Disease-Prediction
```

2. Configure your Environment Variables:
   - Create a `.env` in the root and configure `DB_PASS`, `Fast_api`, `OLLAMA_URL`, etc.

3. Run with Docker Compose (Assuming you map the images via compose):
```bash
docker-compose up --build -d
```
*(Alternatively, navigate to each service directory and spin them up individually via `docker build` and `docker run` commands detailed in their respective local READMEs).*

## 🧠 Model Deployment Notes

**"Should I include the model inside the Dockerfile or deploy separately?"**

Because MobileNetV2 is incredibly lightweight (~35MB total for checkpoints and dictionaries), we have explicitly configured the `DL-service` Dockerfile to **include the model directly inside**. 
This provides maximum flexibility:
- **Render Deployment**: You can host the `DL-service` purely as an independent microservice API on a platform like Render and fetch its URL in the `.env` (`Fast_api=https://...`).
- **AWS / Cloud Deployment**: You can deploy all three containers via ECS or EKS without worrying about mounting external s3 volumes for model weights. 

*The custom `dockerfile` in `DL-service` explicitly installs the `CPU` variant of PyTorch, cutting container size drastically and keeping it heavily optimized for cheap cloud compute lines!*

## 🧑‍💻 Author

Created with ❤️ by **[Sathvik33](https://github.com/Sathvik33)**.
