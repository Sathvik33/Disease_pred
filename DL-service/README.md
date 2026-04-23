<div align="center">

# 🧠 DL-service — ONNX Inference API

**FastAPI · ONNX Runtime · Python 3.11 · 38-class Plant Disease Classification**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![ONNX](https://img.shields.io/badge/ONNX_Runtime-005CED?style=for-the-badge&logo=onnx&logoColor=white)](#)

</div>

---

## Overview

DL-service is a self-contained Python microservice that runs plant disease inference using an **ONNX-exported MobileNet model** fine-tuned on the PlantVillage dataset. It receives a leaf image via HTTP, runs it through the ONNX Runtime session, and returns a structured prediction response.

The service is deliberately **decoupled from the rest of the system** — it has no knowledge of users, the database, or the LLM agent. It does one thing: classify a leaf image as fast and accurately as possible.

---

## Model Details

| Property | Value |
|---|---|
| **Architecture** | MobileNet (fine-tuned) |
| **Export format** | ONNX (`model/best_model.onnx`) |
| **Runtime** | ONNX Runtime — `CPUExecutionProvider` |
| **Classes** | 38 (disease variants + healthy variants across 14 plant species) |
| **Input** | RGB image, preprocessed to model's expected size |
| **Output** | Softmax probability distribution over 38 classes |

### Plant species covered

Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato — and their healthy variants.

---

## Prediction Logic

```python
# 1. Run ONNX inference
outputs = session.run(None, {input_name: input_numpy})[0]

# 2. Softmax over raw logits
probs = softmax(outputs[0])

# 3. Top-1 prediction
predicted_idx = argmax(probs)
confidence    = probs[predicted_idx]

# 4. Shannon entropy — measure of model uncertainty
entropy      = -Σ p * log(p)
norm_entropy = entropy / log(num_classes)

# 5. Is-plant gate — rejects non-leaf images
#    Prevents LLM agent from being invoked on unrelated images
is_plant = confidence > 0.40 AND norm_entropy < 0.65
```

The `is_plant` gate is the key quality filter. If it returns `false`, the backend immediately returns an error to the user without invoking the LLM agent, saving API quota and latency.

---

## API

### `GET /`

Health check.

```json
{ "message": "Welcome" }
```

### `POST /predict`

**Request:** `multipart/form-data` with a single `file` field (any image format supported by Pillow).

**Response (success):**

```json
{
  "disease":    "Apple___Cedar_apple_rust",
  "confidence": 0.9731,
  "is_plant":   true,
  "entropy":    0.1842
}
```

**Response (non-plant image):**

```json
{
  "disease":    "Tomato___healthy",
  "confidence": 0.3102,
  "is_plant":   false,
  "entropy":    0.7413
}
```

**Response (error):**

```json
{ "detail": "error message" }
```
HTTP 500 if inference fails.

---

## Project Structure

```
DL-service/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, /predict endpoint
│   ├── model_loader.py   # ONNX InferenceSession loaded once at startup
│   └── utils.py          # Image preprocessing (resize, normalize, to tensor)
├── model/
│   ├── best_model.onnx   # Trained ONNX model weights
│   └── class_names.json  # ["Apple___Apple_scab", ..., "Tomato___healthy"]
├── requirements.txt
└── dockerfile
```

> **Important:** The `model/` directory must be present before building the Docker image. It contains the ONNX weights and class name mapping — both are baked into the container at build time via `COPY model ./model`.

---

## Dependencies

```
fastapi        # ASGI web framework
uvicorn        # ASGI server
pillow         # Image loading and conversion
numpy          # Array operations, softmax, argmax
onnxruntime    # ONNX Runtime CPU inference
```

No PyTorch, no CUDA, no heavy ML framework in the final image — just the ONNX runtime. This keeps the image significantly smaller than a PyTorch-based equivalent.

---

## Local Development

```bash
# Prerequisites: Python 3.11+

cd DL-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Test it:
```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/leaf.jpg"
```

---

## Docker

```bash
# Build
docker build -t dl-service:latest .

# Run standalone
docker run -p 8000:8000 dl-service:latest

# Via compose (recommended)
docker compose --env-file ../.env.production up dl-service -d
```

### Multi-Stage build breakdown

| Stage | Base | Purpose |
|---|---|---|
| `builder` | `python:3.11-slim` | Installs gcc + compiles all pip packages into `/install` |
| `runner` | `python:3.11-slim` | Copies only installed packages + app code + model. No build tools. |

**Estimated image size: ~550 MB** (ONNX Runtime with native C++ bindings is unavoidably large; there is no lighter alternative that supports ONNX inference at this scale.)

### Health check

The Dockerfile includes a health check that pings the root `/` endpoint every 30 seconds. Docker Compose waits for `service_healthy` before starting the backend, ensuring inference is ready before any requests are routed.

---

## Deployment Note

Because this service is fully self-contained (model weights baked in, no external dependencies at runtime), it can be deployed independently from the rest of the platform:

- Deploy as a standalone container on **AWS ECS / App Runner / EC2**
- Set `ML_SERVICE_URL=https://your-dl-service-url` in the backend's environment
- The backend will automatically route all inference calls there

---

*Part of the [PlantDoc](../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*
