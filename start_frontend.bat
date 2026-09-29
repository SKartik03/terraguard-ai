@echo off
echo ===================================================
echo Starting TerraGuard AI Frontend (React + Vite)
echo ===================================================
cd /d "%~dp0frontend"
set PATH=C:\Users\Admin\AppData\Local\OpenAI\Codex\runtimes\cua_node\b58ca2eaa616c2da\bin;%PATH%
cmd /c "npm run dev"
pause
