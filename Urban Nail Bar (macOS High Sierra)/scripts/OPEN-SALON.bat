@echo off
title Urban Nail Bar Launcher
cd /d "%~dp0.."
set "SCRIPTS=%~dp0"
echo ============================================
echo   Urban Nail Bar - One-Click Launcher
echo ============================================
echo.
echo [1/2] Starting Kimi AI server (minimized window)...
start "Kimi AI Server - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%START-KIMI-SERVER.bat""
echo [2/2] Waiting for server, then opening your salon...
timeout /t 3 /nobreak >nul
REM Open over http://localhost:3001 (NOT file://) so the My Schedule phone
REM app (PWA) can be installed and everything shares one data origin.
start "" "http://localhost:3001/index.html"
echo.
echo ============================================
echo   Done! Urban Nail Bar is opening in your browser.
echo ============================================
echo.
echo IMPORTANT: The AI server runs in the minimized window
echo "Kimi AI Server - DO NOT CLOSE" in your taskbar.
echo Leave it open while using the salon system.
echo.
echo This window closes in 5 seconds...
timeout /t 5 >nul
exit
