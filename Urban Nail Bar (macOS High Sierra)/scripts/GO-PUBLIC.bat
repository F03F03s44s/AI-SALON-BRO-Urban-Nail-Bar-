@echo off
title Urban Nail Bar - Free Public Website
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"
set "DOMAIN=urban-nail-bar.work.gd"

echo ============================================
echo   Urban Nail Bar - Free Public Access
echo ============================================
echo.
echo   1^) Permanent domain via Caddy + DNS Exit
echo      when configured + ports 80/443 free
echo   2^) Else Tailscale Funnel ^(free *.ts.net^)
echo   3^) Else Pinggy TEMP ^(about 60 minutes^)
echo.
echo   Guide: docs\GO-ONLINE-FREE.md
echo.

REM Prefer permanent Caddy domain when configured
set "USE_PERMANENT=0"
if exist "%ROOT%\server\Caddyfile" if exist "%ROOT%\server\caddy.exe" if exist "%ROOT%\server\dnsexit.env" (
    findstr /I /C:"paste-your-api-key-here" "%ROOT%\server\dnsexit.env" >nul 2>&1
    if errorlevel 1 set "USE_PERMANENT=1"
)

if "%USE_PERMANENT%"=="1" (
    echo Permanent domain configured — launching Caddy path.
    echo ^(Needs admin + router forward 80/443 — Netgear steps in docs^)
    echo.
    call "%SCRIPTS%RUN-PERMANENT-TUNNEL.bat"
    exit /b %ERRORLEVEL%
)

echo Permanent domain not ready yet.
echo   Setup once: scripts\SETUP-PERMANENT-LINK.bat
echo   Then fix Netgear port-forward ^(docs\GO-ONLINE-FREE.md^)
echo.
echo Starting salon + best free tunnel ^(no port-forward^)...
echo.

echo [1/3] Starting salon server (ports 3001 + 3002)...
start "Kimi AI Server - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%START-KIMI-SERVER.bat""
timeout /t 4 /nobreak >nul

echo [2/3] Opening local salon + public booking pages...
start "" "http://localhost:3001/index.html"
start "" "http://localhost:3002/"

echo.
echo [3/3] Opening free public tunnel...
echo.
call "%SCRIPTS%START-FREE-TUNNEL.bat"
echo.
echo Tunnel stopped.
pause
