@echo off
echo ========================================================
echo  Starting RetailPulse - Enterprise Analytics Platform
echo ========================================================
echo.

:: Start Backend in a separate window
echo [1/2] Launching Backend API on http://127.0.0.1:8000 ...
start "RetailPulse Backend (FastAPI)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Start Frontend in a separate window
echo [2/2] Launching Frontend Client on http://localhost:5173 ...
cd frontend
start "RetailPulse Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ========================================================
echo  RetailPulse services launched!
echo  - Live Application: http://localhost:5173
echo  - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
