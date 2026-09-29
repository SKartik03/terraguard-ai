@echo off
echo ===================================================
echo Starting TerraGuard AI Frontend (Vanilla Static Server)
echo ===================================================
cd /d "%~dp0frontend"
set PATH=C:\Python314;C:\Python314\Scripts;%PATH%
python -m http.server 5173 --bind 127.0.0.1
pause
