@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "PneumoniaCNN API" cmd /k "%~dp0start-backend.bat"
if not exist "frontend\node_modules" (
  start "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
) else (
  start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
)
timeout /t 6 >nul
start "" http://localhost:3000
