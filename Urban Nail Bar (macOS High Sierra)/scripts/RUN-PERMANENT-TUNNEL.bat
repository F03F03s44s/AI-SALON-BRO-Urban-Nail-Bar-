@echo off
title Urban Nail Bar - Permanent Domain (Caddy)
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"
set "DOMAIN=urban-nail-bar.work.gd"

echo ============================================
echo   Urban Nail Bar - Permanent Domain
echo   https://%DOMAIN%
echo   ^(Caddy + DNS Exit DDNS^)
echo ============================================
echo.

REM Admin check — ports 80/443 usually need elevation on Windows
net session >nul 2>&1
if errorlevel 1 (
    echo WARNING: Not running as Administrator.
    echo Caddy needs ports 80 and 443 for HTTPS ^(Let's Encrypt^).
    echo Right-click this bat → Run as administrator.
    echo.
    pause
)

call "%SCRIPTS%ENSURE-CADDY.bat"
if errorlevel 1 (
    pause
    exit /b 1
)
if not exist "%ROOT%\server\Caddyfile" (
    echo ERROR: server\Caddyfile missing.
    pause
    exit /b 1
)
if not exist "%ROOT%\server\dnsexit.env" (
    echo ERROR: server\dnsexit.env missing.
    echo Run scripts\SETUP-PERMANENT-LINK.bat first.
    pause
    exit /b 1
)

echo [1/4] Starting salon server (ports 3001 + 3002)...
start "Kimi AI Server - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%START-KIMI-SERVER.bat""
timeout /t 4 /nobreak >nul

echo [2/4] Updating DNS Exit A record NOW, then starting DDNS loop...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPTS%UPDATE-DNSEXIT-IP.ps1" -EnvFile "%ROOT%\server\dnsexit.env"
if errorlevel 1 (
    echo.
    echo WARNING: DNS Exit did not accept the update. Domain will stay dark until:
    echo   1^) New API key at https://dnsexit.com/ → Settings → DNS API Key
    echo   2^) Paste into server\dnsexit.env
    echo   3^) Set A record urban-nail-bar → this PC public IP in DNS Exit panel
    echo Caddy will still start so local HTTPS works after DNS is fixed.
    echo.
)
start "DNS Exit DDNS - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%UPDATE-DNSEXIT-IP.bat""

echo [3/4] Opening local + domain pages...
start "" "http://localhost:3001/index.html"
start "" "http://localhost:3002/"
start "" "https://%DOMAIN%/"
start "" "https://%DOMAIN%/pages/website.html"

echo.
echo ============================================
echo   Keep this window open for online access
echo ============================================
echo.
echo   Website:     https://%DOMAIN%/pages/website.html
echo   Home:        https://%DOMAIN%/
echo   Scheduler:   https://%DOMAIN%/pages/scheduler.html
echo   Booking:     https://%DOMAIN%/booking.html
echo   In-salon:    https://%DOMAIN%/pages/booking.html
echo.
echo   DNS: A record urban-nail-bar → your public IP
echo   Router: forward TCP 80 + 443 → this PC
echo   Netgear: disable Remote Management on WAN 80
echo   Docs: docs\DNS-EXIT-DOMAIN.md
echo   This is the FREE FOREVER path. Temp tunnels are not.
echo.
echo [4/4] Freeing ports 80/443 ^(IIS / HTTP.sys^) then starting Caddy...
call "%SCRIPTS%FREE-PORTS-FOR-CADDY.bat"
if errorlevel 1 (
    echo.
    echo Caddy was NOT started. Fix port 80 using the commands above,
    echo then re-run this bat as Administrator.
    pause
    exit /b 1
)

cd /d "%ROOT%\server"
caddy.exe run --config Caddyfile
if errorlevel 1 (
    echo.
    echo Caddy exited with an error. If bind on :80 failed with
    echo "forbidden by its access permissions", stop IIS and check
    echo excluded port ranges ^(see FREE-PORTS-FOR-CADDY.bat^).
    echo.
)
echo.
echo Caddy stopped.
pause
