from __future__ import annotations

from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path
from threading import Lock

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from torch import nn
from torchvision import transforms

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "pneumonia_cnn.pt"
MAX_IMAGE_BYTES = 10 * 1024 * 1024


class PneumoniaCNN(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.fc1 = nn.Linear(32 * 7 * 7, 64)
        self.fc2 = nn.Linear(64, 2)

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        image = self.pool1(torch.relu(self.conv1(image)))
        image = self.pool2(torch.relu(self.conv2(image)))
        image = torch.flatten(image, start_dim=1)
        image = torch.relu(self.fc1(image))
        return self.fc2(image)



preprocess = transforms.Compose(
    [
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
    ]
)
model: PneumoniaCNN | None = None
threshold = 0.3
model_lock = Lock()


def load_model() -> None:
    global model, threshold
    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Model checkpoint not found: {MODEL_PATH}")

    checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    if not isinstance(checkpoint, dict) or "model_state_dict" not in checkpoint:
        raise RuntimeError("Checkpoint must contain a model_state_dict.")

    loaded_model = PneumoniaCNN()
    loaded_model.load_state_dict(checkpoint["model_state_dict"], strict=True)
    loaded_model.eval()
    model = loaded_model
    threshold = float(checkpoint.get("threshold", 0.3))
    print(f"[PneumoniaCNN] model loaded from {MODEL_PATH} (threshold={threshold})")


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model()
    yield


app = FastAPI(title="PneumoniaCNN API", version="1.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    # Any port on localhost / 127.0.0.1 / private LAN IPs (Next.js may start on 3001, 3002, ...)
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ready" if model is not None else "model_not_loaded"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, object]:
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="مدل هنوز بارگذاری نشده است.")
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="فرمت تصویر باید JPG یا PNG باشد.")

    contents = await file.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="حجم تصویر باید کمتر از ۱۰ مگابایت باشد.")
    if not contents:
        raise HTTPException(status_code=400, detail="فایل تصویر خالی است.")

    try:
        with Image.open(BytesIO(contents)) as source:
            image = preprocess(source.convert("L")).unsqueeze(0)
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="فایل ارسال‌شده یک تصویر معتبر نیست.") from error

    with model_lock, torch.inference_mode():
        logits = model(image)
        probabilities = torch.softmax(logits, dim=1)[0]

    normal_probability = float(probabilities[0].item())
    pneumonia_probability = float(probabilities[1].item())
    label = "Pneumonia" if pneumonia_probability >= threshold else "Normal"
    confidence = pneumonia_probability if label == "Pneumonia" else normal_probability

    return {
        "prediction": label,
        "label": "پنومونی" if label == "Pneumonia" else "نرمال",
        "confidence": confidence,
        "probabilities": {
            "Normal": normal_probability,
            "Pneumonia": pneumonia_probability,
        },
        "threshold": threshold,
        "model": "PneumoniaCNN",
    }


if __name__ == "__main__":
    import uvicorn

    # Lets you start the API with `python backend/main.py` from any folder.
    uvicorn.run(app, host="127.0.0.1", port=8000)
