@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Frontend and API run on different origins locally; child windows inherit this.
set "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api"
start "PneumoniaCNN API" cmd /k "%~dp0start-backend.bat"
if not exist "frontend\node_modules" (
  start "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
) else (
  start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
)
timeout /t 6 >nul
start "" http://localhost:3000
