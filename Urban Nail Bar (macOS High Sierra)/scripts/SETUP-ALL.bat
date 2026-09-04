@echo off
title Urban Nail Bar - Full Setup
cd /d "%~dp0.."
set "ROOT=%CD%"
echo ============================================
echo   Urban Nail Bar - Complete Setup
echo ============================================
echo.
echo [1/5] Installing Python packages (Pillow, segno, reportlab)...
pip install Pillow segno reportlab -q
if errorlevel 1 (echo pip install failed.& pause & exit /b 1)
echo.
echo [2/5] Generating PWA icons + gallery placeholders...
python setup-assets.py
if errorlevel 1 (echo Asset generation failed.& pause & exit /b 1)
echo.
echo [3/5] Downloading Caddy (public HTTPS proxy for urban-nail-bar.work.gd)...
call "%~dp0ENSURE-CADDY.bat"
if errorlevel 1 (echo Caddy download failed - check internet.& pause & exit /b 1)
if not exist "%ROOT%\server\dnsexit.env" if exist "%ROOT%\server\dnsexit.env.example" (
    copy /Y "%ROOT%\server\dnsexit.env.example" "%ROOT%\server\dnsexit.env" >nul
    echo   Created server\dnsexit.env — paste your DNS Exit API key before go-live
)
echo.
echo [4/5] Installing server Node packages...
cd /d "%ROOT%\server"
call npm install
cd /d "%ROOT%"
echo.
echo [5/5] Regenerating QR sign + Instagram post + validation...
python print\_make_sign.py
python marketing\_make_ig_post.py
node validate.js
if errorlevel 1 (
    echo.
    echo Setup finished but validation found issues - review above.
    pause
    exit /b 1
)
echo.
echo ============================================
echo   SETUP COMPLETE - System is ready!
echo.
echo   Open the scripts\ folder and run:
echo   EVERYTHING-WINDOWS.bat                  Windows - one click everything
echo   EVERYTHING-MACOS-HIGH-SIERRA-10.13.command High Sierra 10.13
echo   EVERYTHING-MACOS-BIG-SUR-11.7.10.command Big Sur 11.7.10
echo   OPEN-SALON.bat        Staff salon only
echo   START-PUBLIC.bat      Public booking tunnel
echo   VALIDATE.bat          Health check anytime
echo   seed-demo-day.html    Load demo data (repo root)
echo ============================================
pause
