#!/usr/bin/env bash
set -e

echo "========================================================"
echo " Starting RetailPulse - Enterprise Analytics Platform"
echo "========================================================"

# Start backend in background
echo "[1/2] Starting FastAPI backend on http://127.0.0.1:8000..."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "[2/2] Starting Frontend client on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT

echo "========================================================"
echo " RetailPulse services running:"
echo " - Web App: http://localhost:5173"
echo " - API Docs: http://127.0.0.1:8000/docs"
echo " Press Ctrl+C to terminate both services."
echo "========================================================"

wait
