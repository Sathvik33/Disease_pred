import torch
import torch.nn as nn
from torchvision import models
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "model" / "best_model.pth"
CLASS_PATH = BASE_DIR.parent / "model" / "class_names.json"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

with open(CLASS_PATH, "r") as f:
    class_names = json.load(f)

num_classes = len(class_names)


def load_model():
    model = models.mobilenet_v2(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(in_features, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, num_classes)
    )

    checkpoint = torch.load(MODEL_PATH, map_location=device)

    state_dict = checkpoint["model_state_dict"]

    if list(state_dict.keys())[0].startswith("module."):
        state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()

    return model

model = load_model()