from dotenv import load_dotenv
load_dotenv()
import torch
from torchvision import datasets, models
from torch.utils.data import DataLoader
from torchvision.transforms import v2
import os
from torch.amp import GradScaler, autocast
import json
from tqdm import tqdm
import torch.nn as nn
import torch.optim as optim
from pathlib import Path 
import wandb
import weave

data_dir = Path("Data")/"New Plant Diseases Dataset(Augmented)" / "New Plant Diseases Dataset(Augmented)"
Model_dir =Path("Model")
Model_dir.mkdir(parents=True, exist_ok=True)


Batch_size = 64
epochs = 20
img_size = 224
le = 1e-3

train_transforms = v2.Compose([
    v2.Resize((img_size, img_size)),
    v2.RandomHorizontalFlip(),
    v2.RandomRotation(20),
    v2.ColorJitter(brightness=0.2, contrast=0.2),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize([0.485, 0.456, 0.406],
                 [0.229, 0.224, 0.225])
])

valid_transforms = v2.Compose([
    v2.Resize((img_size, img_size)),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize([0.485, 0.456, 0.406],
                 [0.229, 0.224, 0.225])
])

if __name__ == "__main__":

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    wandb.init(
        project = "crop-disease-detection",
        entity  = "sathvik33-lovely-professional-university",
        name    = "mobilenetv2-run1",
        config  = {
            "model"           : "MobileNetV2",
            "epochs"          : epochs,
            "batch_size"      : Batch_size,
            "img_size"        : img_size,
            "learning_rate"   : le,
            "optimizer"       : "Adam",
            "scheduler"       : "ReduceLROnPlateau",
            "device"          : str(device),
            "fine_tune_epoch" : 5,
        }
    )
    weave.init("sathvik33-lovely-professional-university/crop-disease-detection")

    train_dir = data_dir / "train"
    valid_dir = data_dir/ "valid"


    train_dataset= datasets.ImageFolder(train_dir, transform = train_transforms)
    valid_dataset= datasets.ImageFolder(valid_dir, transform = valid_transforms)

    train_loader = DataLoader(train_dataset, batch_size=Batch_size, shuffle=True, num_workers = os.cpu_count(), prefetch_factor=4, pin_memory=True, persistent_workers=True)
    valid_loader = DataLoader(
        valid_dataset, 
        batch_size=Batch_size, 
        shuffle=False, 
        num_workers=os.cpu_count(),
        pin_memory=True,
        persistent_workers=True,
        prefetch_factor=4
    )

    class_names = train_dataset.classes
    num_classes = len(class_names)

    with open(Model_dir / "class_names.json", "w") as f:
        json.dump(class_names, f)

    print("Classes:", num_classes)



    images, labels = next(iter(train_loader))

    print(images.shape)
    print(labels.shape)
    print(labels[:10])


    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    for param in model.features.parameters():
        param.requires_grad = False

    in_features = model.classifier[1].in_features

    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(in_features,512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, num_classes)
    )

    model = model.to(device)
    print(device)
    wandb.watch(model, log="all", log_freq=50)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=le)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)
    scaler = GradScaler()


    best_val_loss = float("inf")

    checkpoint_path = Model_dir / "checkpoint.pth"
    best_model_path = Model_dir / "best_model.pth"

    if checkpoint_path.exists():
        print("Resuming from checkpoint...")
        checkpoint = torch.load(checkpoint_path, map_location=device)
        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])
        scaler.load_state_dict(checkpoint["scaler_state_dict"])
        start_epoch = checkpoint["epoch"] + 1
        best_val_loss = checkpoint["best_val_loss"]
        print(f"Resumed from Epoch {start_epoch}, Best Val Loss: {best_val_loss:.4f}")
    else:
        start_epoch = 0
        print("Starting fresh training...")


    @weave.op()
    def train_epoch(epoch, model, train_loader, optimizer, criterion, scaler, device):
        model.train()
        train_loss = 0
        for images, labels in tqdm(train_loader, desc="Training"):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            with autocast(device_type=device.type):
                outputs = model(images)
                loss    = criterion(outputs, labels)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            train_loss += loss.item()
        return train_loss / len(train_loader)

    @weave.op()
    def validate_epoch(epoch, model, valid_loader, criterion, device, valid_dataset):
        model.eval()
        val_loss = 0
        correct  = 0
        with torch.no_grad():
            for images, labels in tqdm(valid_loader, desc="Validating"):
                images, labels = images.to(device), labels.to(device)
                outputs  = model(images)
                loss     = criterion(outputs, labels)
                val_loss += loss.item()
                _, preds  = torch.max(outputs, 1)
                correct  += (preds == labels).sum().item()
        avg_val_loss = val_loss / len(valid_loader)
        val_acc      = correct  / len(valid_dataset)
        return val_loss, avg_val_loss, val_acc

    for epoch in range(start_epoch, epochs):
        print(f"\nEpoch {epoch+1}/{epochs}")

        if epoch == 5:
            for param in model.features[-3:].parameters():
                param.requires_grad = True
            
            existing_param_ids = {id(p) for group in optimizer.param_groups for p in group["params"]}
            new_params = [p for p in model.features[-3:].parameters() if id(p) not in existing_param_ids]
            
            if new_params:
                optimizer.add_param_group({
                    "params": new_params,
                    "lr"    : 1e-4
                })
                print("Unfreezing last 3 feature blocks for fine-tuning")
            else:
                print("Fine-tune params already in optimizer — skipping")

        avg_train_loss = train_epoch(
            epoch, model, train_loader, optimizer, criterion, scaler, device
        )
        val_loss, avg_val_loss, val_acc = validate_epoch(
            epoch, model, valid_loader, criterion, device, valid_dataset
        )

        current_lr = optimizer.param_groups[0]["lr"]

        print(f"Train Loss  : {avg_train_loss:.4f}")
        print(f"Val Loss    : {avg_val_loss:.4f}")
        print(f"Val Accuracy: {val_acc:.4f}")
        print(f"LR          : {current_lr}")

        wandb.log({
            "epoch"      : epoch + 1,
            "train_loss" : avg_train_loss,
            "val_loss"   : avg_val_loss,
            "val_acc"    : val_acc,
            "lr"         : current_lr,
        }, step=epoch)

        torch.save({
            "epoch"                : epoch,
            "model_state_dict"     : model.state_dict(),
            "optimizer_state_dict" : optimizer.state_dict(),
            "scheduler_state_dict" : scheduler.state_dict(),
            "scaler_state_dict"    : scaler.state_dict(),
            "best_val_loss"        : best_val_loss,
            "val_acc"              : val_acc,
        }, checkpoint_path)
        print(f"Checkpoint saved (Epoch {epoch+1})")

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save({
                "epoch"            : epoch,
                "model_state_dict" : model.state_dict(),
                "val_loss"         : avg_val_loss,
                "val_acc"          : val_acc,
            }, best_model_path)
            print(f"Best model saved! Val Loss: {avg_val_loss:.4f}")
            wandb.run.summary["best_val_loss"] = avg_val_loss
            wandb.run.summary["best_val_acc"]  = val_acc
            wandb.run.summary["best_epoch"]    = epoch + 1

        scheduler.step(val_loss)

    wandb.finish()