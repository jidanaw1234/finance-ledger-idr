@echo off
echo ========================================================
echo   Finance Ledger IDR - Personal Finance Tracker
echo ========================================================
echo Memulai Backend REST API & Telegram Bot (Port 4000)...
start "Finance Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Menunggu 2 detik...
timeout /t 2 /nobreak >nul

echo Memulai Frontend Web Dashboard (Port 3000)...
start "Finance Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Aplikasi sedang dijalankan!
echo Buka browser di: http://localhost:3000
echo ========================================================
pause

