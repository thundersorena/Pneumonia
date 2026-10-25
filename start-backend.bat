@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo [1/3] Checking Python...
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.10+ from https://www.python.org and tick "Add python.exe to PATH".
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo [2/3] Creating virtual environment .venv ...
  python -m venv .venv || (echo Failed to create venv & pause & exit /b 1)
  echo Installing packages - first run can take a few minutes because of PyTorch...
  ".venv\Scripts\python.exe" -m pip install --upgrade pip
  ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt || (echo Package install failed & pause & exit /b 1)
) else (
  echo [2/3] Virtual environment already exists.
)

echo [3/3] Starting API on http://127.0.0.1:8000  (Ctrl+C to stop)
".venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
