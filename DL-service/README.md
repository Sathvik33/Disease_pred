<div align="center">

# 🧠 DL-Service — ONNX Inference Microservice

**FastAPI · ONNX Runtime · Python 3.11 · 38-Class Plant Disease Classification**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![ONNX](https://img.shields.io/badge/ONNX_Runtime-005CED?style=for-the-badge&logo=onnx&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)](#)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Model Details](#-model-details)
- [Inference Pipeline](#-inference-pipeline)
- [Non-Plant Image Filter](#-non-plant-image-filter)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Dependencies](#-dependencies)
- [Local Development](#-local-development)
- [Docker](#-docker)
- [Deployment](#-deployment)

---

## Overview

DL-service is a **self-contained Python microservice** that performs plant disease classification using an **ONNX-exported MobileNet** fine-tuned on the PlantVillage dataset. It receives a leaf image via HTTP, preprocesses it, runs ONNX Runtime inference, and returns a structured prediction response.

The service is **deliberately decoupled** from the rest of the system — it has no knowledge of users, the database, or the LLM agent. It does one thing: **classify a leaf image as fast and accurately as possible.**

### Design Principles

- **Single Responsibility**: Only inference — no auth, no database, no business logic
- **Startup Optimization**: ONNX session loaded once at import time, reused for all requests
- **Lightweight Runtime**: No PyTorch, no CUDA — just ONNX Runtime with CPU provider
- **Self-Validation**: Built-in non-plant image rejection (confidence + entropy + green dominance)

---

## 🧬 Model Details

| Property | Value |
|---|---|
| **Architecture** | MobileNet (fine-tuned transfer learning) |
| **Training Data** | [PlantVillage Dataset](https://data.mendeley.com/datasets/tywbtsjrjv/1) (Augmented) |
| **Export Format** | ONNX (`model/best_model.onnx`, ~11 MB) |
| **Runtime** | ONNX Runtime — `CPUExecutionProvider` |
| **Classes** | 38 (disease + healthy variants across 14 plant species) |
| **Input Shape** | `[1, 3, 224, 224]` (NCHW format) |
| **Normalization** | ImageNet: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225] |
| **Output** | Raw logits → softmax → probability distribution over 38 classes |
| **Experiment Tracking** | Weights & Biases (W&B) |

### Supported Plant Species (14) and Disease Classes (38)

| Plant | Diseases |
|---|---|
| **Apple** | Apple Scab, Black Rot, Cedar Apple Rust, Healthy |
| **Blueberry** | Healthy |
| **Cherry** | Powdery Mildew, Healthy |
| **Corn (Maize)** | Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy |
| **Grape** | Black Rot, Esca (Black Measles), Leaf Blight, Healthy |
| **Orange** | Huanglongbing (Citrus Greening) |
| **Peach** | Bacterial Spot, Healthy |
| **Pepper (Bell)** | Bacterial Spot, Healthy |
| **Potato** | Early Blight, Late Blight, Healthy |
| **Raspberry** | Healthy |
| **Soybean** | Healthy |
| **Squash** | Powdery Mildew |
| **Strawberry** | Leaf Scorch, Healthy |
| **Tomato** | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, TYLCV, Mosaic Virus, Healthy |

---

## ⚡ Inference Pipeline

The complete prediction pipeline from image upload to response:

```
Image Upload (multipart/form-data)
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  1. Image Loading                                    │
│     PIL.Image.open(bytes) → RGB conversion           │
│                                                      │
│  2. Preprocessing (utils.py)                         │
│     ├── Resize to 224×224                            │
│     ├── Normalize to [0, 1] (÷ 255)                 │
│     ├── ImageNet normalization                       │
│     │   img = (img - [0.485, 0.456, 0.406])          │
│     │       / [0.229, 0.224, 0.225]                  │
│     ├── Transpose: HWC → CHW                         │
│     └── Expand dims: [3,224,224] → [1,3,224,224]     │
│                                                      │
│  3. ONNX Inference                                   │
│     session.run(None, {input_name: tensor})           │
│     → raw logits [1, 38]                             │
│                                                      │
│  4. Post-Processing                                  │
│     ├── Softmax: exp(logits) / Σ exp(logits)         │
│     ├── Top-1: argmax(probs) → class index           │
│     ├── Confidence: probs[predicted_idx]              │
│     └── Shannon entropy: -Σ p·log(p)                 │
│         normalized: entropy / log(38)                │
│                                                      │
│  5. Green Dominance Analysis                         │
│     ├── Resize image to 64×64                        │
│     ├── Count pixels where G > R AND G > B           │
│     └── green_ratio = mean(green_dominant)           │
│                                                      │
│  6. Is-Plant Gate                                    │
│     is_plant = confidence > 0.55                     │
│            AND norm_entropy < 0.50                   │
│            AND green_ratio > 0.12                    │
└─────────────────────────────────────────────────────┘
    │
    ▼
Response: { disease, confidence, is_plant, entropy }
```

---

## 🛡 Non-Plant Image Filter

The `is_plant` gate is the **key quality filter** that prevents non-leaf images from reaching the LLM agent. It uses a three-criteria check:

```python
is_plant = (
    confidence > 0.55           # Model must be reasonably confident
    and norm_entropy < 0.50     # Probability distribution must not be too uniform
    and green_ratio > 0.12      # Image must contain sufficient green pixels
)
```

### Why Three Gates?

| Gate | Purpose | What It Catches |
|---|---|---|
| **Confidence > 0.55** | Model certainty | Random objects, text, screenshots |
| **Normalized Entropy < 0.50** | Distribution sharpness | Images where model is confused across many classes |
| **Green Ratio > 0.12** | Color validation | Non-plant photos (cars, people, buildings) |

### How Green Dominance Works

```python
def _green_dominance(image: Image) -> float:
    img = image.resize((64, 64))         # Downsample for speed
    r, g, b = split_channels(img)
    green_dominant = (g > r) & (g > b)    # Per-pixel: is green the strongest channel?
    return mean(green_dominant)            # Fraction of green-dominant pixels
```

If `is_plant = false`, the backend returns an error immediately — the LLM agent is **never invoked**, saving API quota, compute, and ~15-30s of latency.

---

## 📡 API Reference

### `GET /`

Health check endpoint. Used by Docker Compose to verify service readiness before starting the backend.

**Response:**
```json
{ "message": "Welcome" }
```

### `POST /predict`

Classify a plant leaf image.

**Request:** `multipart/form-data` with a single `file` field. Any image format supported by Pillow (JPEG, PNG, WebP, BMP, etc.).

**Success Response (plant detected):**
```json
{
    "disease": "Apple___Cedar_apple_rust",
    "confidence": 0.9731,
    "is_plant": true,
    "entropy": 0.1842
}
```

**Success Response (non-plant image):**
```json
{
    "disease": "Tomato___healthy",
    "confidence": 0.3102,
    "is_plant": false,
    "entropy": 0.7413
}
```

**Error Response (HTTP 500):**
```json
{
    "detail": "error description"
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `disease` | `string` | Predicted class name (e.g., `"Tomato___Late_blight"`) |
| `confidence` | `float` | Softmax probability of the top-1 prediction (0.0 – 1.0) |
| `is_plant` | `boolean` | Whether the image passes the three-gate plant validation |
| `entropy` | `float` | Normalized Shannon entropy of the probability distribution (0.0 – 1.0) |

### Testing with cURL

```bash
# Predict on a local image
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/leaf.jpg"

# Predict on a test image from the dataset
curl -X POST http://localhost:8000/predict \
  -F "file=@Data/test/AppleScab1.JPG"
```

---

## 📂 Project Structure

```
DL-service/
├── app/
│   ├── __init__.py               # Package marker
│   ├── main.py                   # FastAPI app — /predict endpoint + green dominance
│   ├── model_loader.py           # ONNX InferenceSession loaded once at import time
│   └── utils.py                  # Image preprocessing: resize → normalize → transpose
├── model/
│   ├── best_model.onnx           # Trained ONNX model weights (~11 MB)
│   └── class_names.json          # 38-element array of class labels
├── Data/                         # Training/test data (gitignored — not in repo)
│   ├── New Plant Diseases Dataset(Augmented)/
│   └── test/
├── requirements.txt              # Python dependencies (no PyTorch)
├── dockerfile                    # Multi-stage: builder (gcc + pip) → slim runner
├── .dockerignore                 # Excludes Data/, wandb/, .env, etc.
├── .env                          # W&B API key (gitignored)
└── README.md                     # ← You are here
```

> [!IMPORTANT]
> The `model/` directory must be present before building the Docker image. It contains the ONNX weights and class name mapping — both are baked into the container at build time via `COPY model ./model`.

---

## 📦 Dependencies

```
fastapi              # ASGI web framework
uvicorn              # ASGI server (production-ready)
pillow               # Image loading, conversion, and resizing
numpy                # Array operations, softmax, argmax, entropy
onnxruntime          # ONNX Runtime CPU inference engine
python-multipart     # Multipart form parsing (required by FastAPI file uploads)
```

> [!NOTE]
> **No PyTorch, no TensorFlow, no CUDA** — just the ONNX runtime. This keeps the Docker image ~550 MB vs ~2+ GB for a PyTorch-based equivalent.

---

## 💻 Local Development

### Prerequisites

- **Python 3.11+**
- **Model files**: `model/best_model.onnx` and `model/class_names.json` must be present

### Setup

```bash
cd DL-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Linux/Mac
.\venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Run with hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing

```bash
# Health check
curl http://localhost:8000/

# Predict
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/leaf_image.jpg"
```

### Interactive API Docs

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🐳 Docker

### Build & Run

```bash
# From repo root (recommended — uses compose)
docker compose --env-file .env.production build dl-service
docker compose --env-file .env.production up dl-service -d

# View logs
docker compose logs dl-service --follow

# Or standalone
cd DL-service
docker build -t dl-service:latest .
docker run -p 8000:8000 dl-service:latest
```

### Multi-Stage Build

| Stage | Base | Purpose |
|---|---|---|
| `builder` | `python:3.11-slim` | Install `gcc` + compile all pip packages into `/install` prefix |
| `runner` | `python:3.11-slim` | Copy installed packages + app code + model weights. No build tools. |

### Security

- Runs as **non-root user** (`appuser:appgroup`)
- No build tools (gcc) in final image
- No development dependencies
- Read-only application files

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"
```

Docker Compose uses `condition: service_healthy` to ensure the ONNX model is fully loaded before the backend starts sending inference requests.

**Estimated image size: ~550 MB**

> The image size is dominated by ONNX Runtime's native C++ bindings. There is no lighter alternative that supports ONNX inference at this scale.

---

## ☁️ Deployment

### Standalone Deployment

Because this service is fully self-contained (model weights baked in, no external dependencies at runtime), it can be deployed independently:

```bash
# Deploy as standalone container
docker run -d \
  --name dl-service \
  -p 8000:8000 \
  --restart unless-stopped \
  dl-service:latest
```

Then set `ML_SERVICE_URL=http://<your-dl-service-host>:8000` in the backend environment.

### Supported Deployment Targets

| Platform | Notes |
|---|---|
| **AWS EC2** | Current production deployment via GitHub Actions + ECR |
| **AWS ECS / Fargate** | Good for auto-scaling based on inference load |
| **AWS App Runner** | Simplest option — auto-scales, no infrastructure management |
| **Google Cloud Run** | Serverless containers with cold-start tradeoff |
| **Render** | Simple Docker deployment with free tier |
| **DigitalOcean App Platform** | Docker deployment with built-in monitoring |

### Performance Considerations

| Metric | Typical Value |
|---|---|
| **Cold start** | ~5-10s (ONNX session initialization) |
| **Inference latency** | ~50-150ms per image (CPU) |
| **Memory usage** | ~300-500 MB |
| **Concurrent requests** | 1 worker (CPU-bound — scale horizontally for throughput) |

---

<div align="center">

*Part of the [PlantDoc](../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*

</div>
