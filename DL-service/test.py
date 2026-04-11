import torch
from torchvision import models
from torchvision.transforms import v2
from torch.utils.data import DataLoader, Dataset
import torch.nn as nn
from pathlib import Path
import json
from PIL import Image
import os
from tqdm import tqdm

data_dir       = Path("Data")
test_dir       = data_dir / "test" / "test"
Model_dir      = Path("Model")
best_model_path = Model_dir / "best_model.pth"
class_names_path = Model_dir / "class_names.json"

with open(class_names_path, "r") as f:
    class_names = json.load(f)
num_classes = len(class_names)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using: {device}")

test_transforms = v2.Compose([
    v2.Resize((224, 224)),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize([0.485, 0.456, 0.406],
                 [0.229, 0.224, 0.225])
])

class TestDataset(Dataset):
    def __init__(self, test_dir, transform=None):
        self.image_paths = list(Path(test_dir).glob("*.jpg")) + \
                           list(Path(test_dir).glob("*.jpeg")) + \
                           list(Path(test_dir).glob("*.png"))
        self.transform   = transform
        print(f"Found {len(self.image_paths)} images in test folder")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image    = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, str(img_path.name)

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

checkpoint = torch.load(best_model_path, map_location=device)
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

print(f"Model loaded! (Best epoch: {checkpoint['epoch']+1}, Val Acc: {checkpoint['val_acc']*100:.2f}%)")

test_dataset = TestDataset(test_dir, transform=test_transforms)
test_loader  = DataLoader(test_dataset, batch_size=8, shuffle=False, num_workers=0)

print(f"\n{'─'*60}")
print(f"{'Image':<35} {'Prediction':<25} {'Confidence'}")
print(f"{'─'*60}")

all_predictions = []

with torch.no_grad():
    for images, filenames in tqdm(test_loader, desc="Testing"):
        images  = images.to(device)
        outputs = torch.softmax(model(images), dim=1)
        confs, preds = torch.max(outputs, dim=1)

        for fname, pred, conf in zip(filenames, preds, confs):
            class_name = class_names[pred.item()]
            confidence = conf.item() * 100
            all_predictions.append({
                "image"      : fname,
                "prediction" : class_name,
                "confidence" : confidence
            })
            print(f"{fname:<35} {class_name:<25} {confidence:.2f}%")

print(f"\n{'─'*60}")
print(f"Total images tested : {len(all_predictions)}")
avg_conf = sum(p["confidence"] for p in all_predictions) / len(all_predictions)
print(f"Average confidence  : {avg_conf:.2f}%")
print(f"{'─'*60}")