from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import io
import torch
from app.model_loader import model, class_names, device
from app.utils import preprocess_image

app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "Welcome"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        images_bytes = await file.read()
        image = Image.open(io.BytesIO(images_bytes)).convert("RGB")

        input_tensor = preprocess_image(image).to(device)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

            confidence, predicted_idx = torch.max(probabilities, 0)
        predicted_class = class_names[predicted_idx.item()]

        return {
            "disease": predicted_class,
            "confidence": float(confidence.item())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))