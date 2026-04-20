<div align="center">
  <h1>🧠 Deep Learning Inference Service</h1>
  <p><strong>Fast, Lightweight Image Classification API powered by PyTorch</strong></p>

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](#)
  [![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)](#)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
</div>

## 📌 Overview

This Python microservice implements a `FastAPI` wrapper around a fine-tuned **MobileNetV2** deep learning model. When it receives leaf imagery from the main backend, it processes it locally yielding incredibly low-latency diagnostic metrics.

### ✨ Features
- **MobileNetV2 Power**: Tuned to accurately classify 38 unique plant diseases including healthy variants.
- **Top-K Prediction Arrays**: Produces confidence measures and entropy normalization to filter false positives or non-plant elements.
- **Container Optimized**: Designed deliberately for environments heavily constrained on storage and compute resources.

## 🛠️ Setup & Running Locally

Ensure you have Python 3.10+ installed.

1. Install Dependencies:
```bash
pip install -r requirements.txt
```

2. Spin up Uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🐳 Docker Optimization & Deployment

Because this service utilizes deep computer vision models, keeping footprint size small is critical for cheaper cloud deployment (Render, AWS App Runner, ECS).

Our `Dockerfile` actively tackles this by leveraging a **Multi-Stage Python virtual environment build** and forces the strict fetching of the explicit **PyTorch CPU-only wheel**. This slashes hundreds of megabytes of unused CUDA drivers out of the image!

```bash
docker build -t dl-service:latest .
docker run -p 8000:8000 dl-service:latest
```

### Note on Platform Scalability 🌐
This folder fundamentally acts completely detached from the core backend logic. You can push this single container directly to `Render` as a web service and use the provided URL to update your `.env` in the Backend repository.

---
*Built by [@Sathvik33](https://github.com/Sathvik33) as part of the Disease-Prediction Platform.*
