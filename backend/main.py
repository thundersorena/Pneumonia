from __future__ import annotations

import os
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import numpy as np
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

try:  # `uvicorn backend.main:app` from the repo root (start-backend.bat)
    from .inference import forward, load_checkpoint, preprocess, softmax
except ImportError:  # `main:app` with backend/ as the root (Vercel service, `python main.py`)
    from inference import forward, load_checkpoint, preprocess, softmax

BACKEND_DIR = Path(__file__).resolve().parent
REPO_DIR = BACKEND_DIR.parent
MODEL_FILENAMES = ("pneumonia_cnn.pt", "pneumonia_cnn.npz")
# Public path prefix. On Vercel the top-level rewrite `/api/(.*)` forwards the
# original path unchanged, so every route must live under this prefix.
API_PREFIX = "/api"
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def resolve_model_path() -> Path:
    """Find the checkpoint.

    Order: $MODEL_PATH, then backend/ (the only folder bundled when the backend is
    deployed as its own Vercel service), then the repo root (legacy local layout).
    """
    override = os.environ.get("MODEL_PATH")
    candidates = [Path(override)] if override else []
    for directory in (BACKEND_DIR, REPO_DIR):
        candidates += [directory / name for name in MODEL_FILENAMES]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return candidates[0]


MODEL_PATH = resolve_model_path()
weights: dict[str, np.ndarray] | None = None
threshold = 0.3


def load_model() -> None:
    global weights, threshold
    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Model checkpoint not found: {MODEL_PATH}")
    weights, threshold = load_checkpoint(MODEL_PATH)
    print(f"[PneumoniaCNN] model loaded from {MODEL_PATH} (threshold={threshold})")


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model()
    yield


app = FastAPI(title="PneumoniaCNN API", version="1.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    # Only needed for split local dev (Next.js on :3000 calling uvicorn on :8000).
    # On Vercel both services share one origin, so the browser never sends a CORS preflight.
    # Any port on localhost / 127.0.0.1 / private LAN IPs (Next.js may start on 3001, 3002, ...)
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

router = APIRouter(prefix=API_PREFIX)


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ready" if weights is not None else "model_not_loaded"}


@router.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, object]:
    if weights is None:
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
            image = preprocess(source)
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="فایل ارسال‌شده یک تصویر معتبر نیست.") from error

    # Pure function over read-only weights: safe to run concurrently, no lock needed.
    probabilities = softmax(forward(weights, image))

    normal_probability = float(probabilities[0])
    pneumonia_probability = float(probabilities[1])
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


app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    # Lets you start the API with `python backend/main.py` from any folder.
    uvicorn.run(app, host="127.0.0.1", port=8000)
