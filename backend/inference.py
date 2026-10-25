"""NumPy-only inference for PneumoniaCNN.

PyTorch is only needed for training. At serving time the network is two 3x3
convolutions and two dense layers on a 28x28 image, which NumPy handles in well
under a millisecond. Dropping torch/torchvision keeps the Vercel function far
below its bundle size limit (torch alone is several hundred MB).

The checkpoint can be either:
  * the original ``pneumonia_cnn.pt`` written by ``torch.save`` — it is read
    without importing torch, using a restricted unpickler that only rebuilds
    tensors as NumPy arrays; or
  * a ``.npz`` file with the same state-dict keys (plus optional ``threshold``).
"""

from __future__ import annotations

import pickle
import zipfile
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

INPUT_SIZE = 28
DEFAULT_THRESHOLD = 0.3

REQUIRED_KEYS = (
    "conv1.weight", "conv1.bias",
    "conv2.weight", "conv2.bias",
    "fc1.weight", "fc1.bias",
    "fc2.weight", "fc2.bias",
)

EXPECTED_SHAPES = {
    "conv1.weight": (16, 1, 3, 3), "conv1.bias": (16,),
    "conv2.weight": (32, 16, 3, 3), "conv2.bias": (32,),
    "fc1.weight": (64, 32 * 7 * 7), "fc1.bias": (64,),
    "fc2.weight": (2, 64), "fc2.bias": (2,),
}

# torch storage class name -> NumPy dtype (little-endian, as torch writes them)
_STORAGE_DTYPES = {
    "FloatStorage": np.float32,
    "DoubleStorage": np.float64,
    "HalfStorage": np.float16,
    "BFloat16Storage": None,  # handled specially below
    "LongStorage": np.int64,
    "IntStorage": np.int32,
    "ShortStorage": np.int16,
    "CharStorage": np.int8,
    "ByteStorage": np.uint8,
    "BoolStorage": np.bool_,
}


# --------------------------------------------------------------------------- #
# Loading a torch checkpoint without torch
# --------------------------------------------------------------------------- #
class _StorageType:
    def __init__(self, name: str) -> None:
        if name not in _STORAGE_DTYPES:
            raise pickle.UnpicklingError(f"Unsupported tensor storage type: {name}")
        self.name = name


def _rebuild_tensor(storage: np.ndarray, offset: int, size: tuple[int, ...],
                    stride: tuple[int, ...], *_: Any) -> np.ndarray:
    if not size:
        return np.array(storage[offset])
    itemsize = storage.dtype.itemsize
    view = np.lib.stride_tricks.as_strided(
        storage[offset:],
        shape=tuple(size),
        strides=tuple(s * itemsize for s in stride),
    )
    return np.array(view)  # own the memory, contiguous


def _rebuild_parameter(data: np.ndarray, *_: Any) -> np.ndarray:
    return data


class _TorchCheckpointUnpickler(pickle.Unpickler):
    """Allows only the globals a plain state-dict checkpoint needs."""

    def __init__(self, file: Any, archive: zipfile.ZipFile, prefix: str) -> None:
        super().__init__(file)
        self._archive = archive
        self._prefix = prefix
        self._storages: dict[str, np.ndarray] = {}

    def find_class(self, module: str, name: str) -> Any:
        if module == "collections" and name == "OrderedDict":
            import collections
            return collections.OrderedDict
        if module == "torch._utils" and name == "_rebuild_tensor_v2":
            return _rebuild_tensor
        if module == "torch._utils" and name == "_rebuild_parameter":
            return _rebuild_parameter
        if module == "torch" and name in _STORAGE_DTYPES:
            return _StorageType(name)
        raise pickle.UnpicklingError(f"Refusing to load {module}.{name} from checkpoint")

    def persistent_load(self, pid: Any) -> np.ndarray:
        kind, storage_type, key, _location, _numel = pid
        if kind != "storage" or not isinstance(storage_type, _StorageType):
            raise pickle.UnpicklingError(f"Unexpected persistent id: {pid!r}")
        if key not in self._storages:
            raw = self._archive.read(f"{self._prefix}data/{key}")
            if storage_type.name == "BFloat16Storage":
                bits = np.frombuffer(raw, dtype="<u2").astype(np.uint32) << 16
                array = bits.view(np.float32)
            else:
                array = np.frombuffer(raw, dtype=np.dtype(_STORAGE_DTYPES[storage_type.name]).newbyteorder("<"))
            self._storages[key] = array
        return self._storages[key]


def _load_torch_zip(path: Path) -> Any:
    with zipfile.ZipFile(path) as archive:
        pkl_name = next((n for n in archive.namelist() if n.endswith("data.pkl")), None)
        if pkl_name is None:
            raise RuntimeError(f"{path.name} is not a torch zip checkpoint (no data.pkl).")
        prefix = pkl_name[: -len("data.pkl")]
        with archive.open(pkl_name) as handle:
            return _TorchCheckpointUnpickler(handle, archive, prefix).load()


def load_checkpoint(path: Path) -> tuple[dict[str, np.ndarray], float]:
    """Return (float32 weights, decision threshold)."""
    if path.suffix == ".npz":
        with np.load(path, allow_pickle=False) as data:
            raw = {key: data[key] for key in data.files}
        threshold = float(raw.pop("threshold", DEFAULT_THRESHOLD))
        state = raw
    else:
        checkpoint = _load_torch_zip(path)
        if not isinstance(checkpoint, dict) or "model_state_dict" not in checkpoint:
            raise RuntimeError("Checkpoint must contain a model_state_dict.")
        state = dict(checkpoint["model_state_dict"])
        threshold = float(np.asarray(checkpoint.get("threshold", DEFAULT_THRESHOLD)))

    missing = [k for k in REQUIRED_KEYS if k not in state]
    unexpected = [k for k in state if k not in REQUIRED_KEYS]
    if missing or unexpected:
        raise RuntimeError(f"State dict mismatch. Missing: {missing}; unexpected: {unexpected}")

    weights: dict[str, np.ndarray] = {}
    for key in REQUIRED_KEYS:
        array = np.ascontiguousarray(state[key], dtype=np.float32)
        if array.shape != EXPECTED_SHAPES[key]:
            raise RuntimeError(f"{key} has shape {array.shape}, expected {EXPECTED_SHAPES[key]}")
        weights[key] = array
    return weights, threshold


# --------------------------------------------------------------------------- #
# Forward pass (matches the PyTorch PneumoniaCNN exactly)
# --------------------------------------------------------------------------- #
def _conv3x3_same(x: np.ndarray, weight: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """Conv2d(kernel_size=3, padding=1, stride=1). x: (C, H, W) -> (O, H, W)."""
    channels, height, width = x.shape
    padded = np.pad(x, ((0, 0), (1, 1), (1, 1)))
    # (C, 3, 3, H, W) patches, then contract C and the 3x3 window with the kernel.
    patches = np.lib.stride_tricks.sliding_window_view(padded, (3, 3), axis=(1, 2))
    # sliding_window_view gives (C, H, W, 3, 3)
    out = np.einsum("chwij,ocij->ohw", patches, weight, optimize=True)
    return out + bias[:, None, None]


def _maxpool2x2(x: np.ndarray) -> np.ndarray:
    channels, height, width = x.shape
    h, w = height // 2, width // 2
    return x[:, : h * 2, : w * 2].reshape(channels, h, 2, w, 2).max(axis=(2, 4))


def _relu(x: np.ndarray) -> np.ndarray:
    return np.maximum(x, 0.0)


def forward(weights: dict[str, np.ndarray], image: np.ndarray) -> np.ndarray:
    """image: (1, 28, 28) float32 in [0, 1]. Returns logits of shape (2,)."""
    x = _maxpool2x2(_relu(_conv3x3_same(image, weights["conv1.weight"], weights["conv1.bias"])))
    x = _maxpool2x2(_relu(_conv3x3_same(x, weights["conv2.weight"], weights["conv2.bias"])))
    x = x.reshape(-1)  # same (C, H, W) order as torch.flatten
    x = _relu(weights["fc1.weight"] @ x + weights["fc1.bias"])
    return weights["fc2.weight"] @ x + weights["fc2.bias"]


def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - logits.max()
    exp = np.exp(shifted)
    return exp / exp.sum()


def preprocess(source: Image.Image) -> np.ndarray:
    """Equivalent of transforms.Compose([Resize((28, 28)), ToTensor()]) on a grayscale image.

    torchvision's Resize on a PIL image calls PIL's resize with bilinear filtering
    (antialiased), and ToTensor scales uint8 to [0, 1] with a leading channel axis.
    """
    gray = source.convert("L").resize((INPUT_SIZE, INPUT_SIZE), Image.Resampling.BILINEAR)
    array = np.asarray(gray, dtype=np.float32) / 255.0
    return array[None, :, :]
