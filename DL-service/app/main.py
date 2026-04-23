from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import io
import numpy as np
import math

from app.model_loader import session, class_names, input_name
from app.utils import preprocess_image

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        input_tensor = preprocess_image(image)
        input_numpy = input_tensor.astype(np.float32)

        outputs = session.run(None, {input_name: input_numpy})[0]

        probs = np.exp(outputs[0]) / np.sum(np.exp(outputs[0]))

        predicted_idx = np.argmax(probs)
        confidence = float(probs[predicted_idx])

        entropy = -sum(
            float(p) * math.log(float(p) + 1e-9) for p in probs
        )

        max_entropy = math.log(len(class_names))
        norm_entropy = entropy / max_entropy

        is_plant = confidence > 0.40 and norm_entropy < 0.65

        return {
            "disease": class_names[predicted_idx],
            "confidence": confidence,
            "is_plant": is_plant,
            "entropy": round(norm_entropy, 4),
        }


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 