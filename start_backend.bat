@echo off
echo ===================================================
echo Starting TerraGuard AI Backend (FastAPI + Uvicorn)
echo ===================================================
cd /d "%~dp0backend"
set PATH=C:\Python314;C:\Python314\Scripts;%PATH%
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
