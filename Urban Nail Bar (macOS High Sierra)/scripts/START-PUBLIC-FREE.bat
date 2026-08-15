@echo off
title Urban Nail Bar - Free Public Access
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"
set "DOMAIN=urban-nail-bar.work.gd"

echo ============================================
echo   Urban Nail Bar - Free Public Access
echo ============================================
echo.
echo   FREE FOREVER + custom domain:
echo     Caddy + DNS Exit + router TCP 80+443
echo     https://%DOMAIN%/booking.html
echo     Netgear: docs\DNS-EXIT-DOMAIN.md
echo     Overview: docs\GO-ONLINE-FREE.md
echo.
echo   TEMP ^(NOT unlimited forever; no custom domain^):
echo     Tailscale Funnel ^(*.ts.net^) then Pinggy ~60 min
echo.
echo   [1] Start PERMANENT domain ^(Caddy — needs admin^)
echo   [2] Temp tunnel ^(Tailscale Funnel, else Pinggy^)
echo   [3] One-time permanent setup wizard
echo   [Q] Quit
echo.

choice /C 123Q /N /M "Choose 1-3 or Q"
if errorlevel 4 goto :EOF
if errorlevel 3 goto SETUP
if errorlevel 2 goto TEMP
if errorlevel 1 goto PERMANENT
goto :EOF

:PERMANENT
echo.
echo Starting permanent Caddy path...
echo Use Run as administrator if ports 80/443 fail.
echo.
call "%SCRIPTS%RUN-PERMANENT-TUNNEL.bat"
exit /b %ERRORLEVEL%

:TEMP
echo.
echo [1/2] Starting salon server (ports 3001 + 3002)...
start "Kimi AI Server - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%START-KIMI-SERVER.bat""
timeout /t 4 /nobreak >nul
start "" "http://localhost:3001/index.html"
start "" "http://localhost:3002/"
echo [2/2] Opening free temp tunnel...
echo.
call "%SCRIPTS%START-FREE-TUNNEL.bat"
echo.
echo Tunnel stopped.
pause
exit /b %ERRORLEVEL%

:SETUP
echo.
call "%SCRIPTS%SETUP-PERMANENT-LINK.bat"
exit /b %ERRORLEVEL%
