@echo off
title Kimi AI Proxy Server - Urban Nail Bar
cd /d "%~dp0..\server"
echo ============================================
echo   Urban Nail Bar - Kimi AI Proxy Server
echo ============================================
echo.
echo Checking port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo Starting server on http://localhost:3001 ...
echo KEEP THIS WINDOW OPEN while using the AI Assistant.
echo.
node kimi-proxy-server.js
echo.
echo --------------------------------------------
echo Server stopped or crashed. Read the error above.
pause
