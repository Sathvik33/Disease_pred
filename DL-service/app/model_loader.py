import onnxruntime as ort
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR.parent / "model" / "best_model.onnx"
CLASS_PATH = BASE_DIR.parent / "model" / "class_names.json"

with open(CLASS_PATH, "r") as f:
    class_names = json.load(f)

session = ort.InferenceSession(
    str(MODEL_PATH),
    providers=["CPUExecutionProvider"]
)

input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name