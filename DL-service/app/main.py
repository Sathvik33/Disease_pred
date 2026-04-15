from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import io
import torch
import math
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

            top3_vals, top3_idx = torch.topk(probabilities, 3)

            entropy = -sum(
                p.item() * math.log(p.item() + 1e-9) for p in probabilities
            )
            max_entropy = math.log(len(class_names))
            norm_entropy = entropy / max_entropy

        predicted_class = class_names[predicted_idx.item()]
        conf_val = float(confidence.item())

        is_plant = conf_val > 0.40 and norm_entropy < 0.65

        top3 = [
            {"disease": class_names[top3_idx[i].item()], "confidence": float(top3_vals[i].item())}
            for i in range(3)
        ]

        return {
            "disease": predicted_class,
            "confidence": conf_val,
            "is_plant": is_plant,
            "entropy": round(norm_entropy, 4),
            "top3": top3,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))