@echo off
setlocal EnableDelayedExpansion
title Permanent Domain Setup - Urban Nail Bar (Caddy + DNS Exit)
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"
set "DOMAIN=urban-nail-bar.work.gd"

echo ============================================
echo   Permanent Domain - Urban Nail Bar
echo   Caddy + DNS Exit DDNS
echo ============================================
echo.
echo Domain:  https://%DOMAIN%
echo Proxy:   server\Caddyfile  ^(Caddy, free^)
echo DNS:     DNS Exit A record + Dynamic DNS
echo.
echo FREE FOREVER path = Caddy + DNS Exit + port forward.
echo Temp tunnels are NOT unlimited forever.
echo.
echo One-time checklist:
echo   1^) At DNS Exit: Create/keep an A record for host:
echo      urban-nail-bar → your public IP ^(DDNS updates it^)
echo   2^) Netgear R6700v3: disable Remote Management on WAN 80,
echo      then forward TCP 80 and 443 → this PC LAN IP
echo   3^) Paste DNS Exit API key into server\dnsexit.env
echo.
echo Full steps: docs\DNS-EXIT-DOMAIN.md
echo Free forever vs temp: docs\GO-ONLINE-FREE.md
echo.
pause

echo.
echo [1/4] Ensuring Caddy is installed...
call "%SCRIPTS%ENSURE-CADDY.bat"
if errorlevel 1 (
    pause
    exit /b 1
)
echo   OK: server\caddy.exe

echo.
echo [2/4] DNS Exit API key file...
if not exist "%ROOT%\server\dnsexit.env" (
    copy /Y "%ROOT%\server\dnsexit.env.example" "%ROOT%\server\dnsexit.env" >nul
    echo   Created server\dnsexit.env from example.
    echo   EDIT IT NOW: paste your DNS Exit API key, then re-run this script.
    echo   Dashboard: https://dnsexit.com/  → Settings → API Key
    start notepad "%ROOT%\server\dnsexit.env"
    pause
    exit /b 1
)

findstr /I /C:"paste-your-api-key-here" "%ROOT%\server\dnsexit.env" >nul 2>&1
if not errorlevel 1 (
    echo   server\dnsexit.env still has the placeholder key.
    echo   Paste your real DNS Exit API key, save, then re-run this script.
    start notepad "%ROOT%\server\dnsexit.env"
    pause
    exit /b 1
)
echo   OK: server\dnsexit.env present

echo.
echo [3/4] Checking Caddyfile...
if not exist "%ROOT%\server\Caddyfile" (
    echo ERROR: server\Caddyfile missing.
    pause
    exit /b 1
)
findstr /I /C:"urban-nail-bar.work.gd" "%ROOT%\server\Caddyfile" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Caddyfile does not mention %DOMAIN%
    pause
    exit /b 1
)
echo   OK: Caddyfile targets %DOMAIN%

echo.
echo [4/4] Quick public-IP check ^(for your A record / DDNS^)...
powershell -NoProfile -Command ^
  "try { (Invoke-RestMethod -Uri 'https://api.ipify.org?format=json').ip } catch { 'unknown' }"
echo.
echo At DNS Exit, host "urban-nail-bar" should be an A record
echo for that IP ^(or let UPDATE-DNSEXIT-IP.bat set it^).
echo.

echo ============================================
echo   DONE — next steps
echo ============================================
echo.
echo   1^) DNS Exit — A record:
echo        Type: A
echo        Host: urban-nail-bar
echo        Value: ^(your public IP above^)
echo        TTL:  300 or Automatic
echo.
echo   2^) Netgear R6700v3 — port forward ^(critical^):
echo        a^) Login http://192.168.1.1
echo        b^) Advanced → Remote Management → DISABLE ^(frees WAN 80^)
echo        c^) Advanced → Port Forwarding:
echo             TCP 80  → this PC LAN IP port 80
echo             TCP 443 → this PC LAN IP port 443
echo        d^) If WAN 80 still shows router login, remotes mgmt is still on.
echo.
echo   3^) Start ^(as Administrator^):
echo        scripts\RUN-PERMANENT-TUNNEL.bat
echo      or START-SALON.bat  ^(uses Caddy when configured^)
echo      or scripts\START-PUBLIC-FREE.bat → option 1
echo.
echo   URLs:
echo     Website:   https://%DOMAIN%/pages/website.html
echo     Booking:   https://%DOMAIN%/booking.html
echo     Scheduler: https://%DOMAIN%/pages/scheduler.html
echo.
echo   Until ports work: START-PUBLIC-FREE.bat → Tailscale Funnel
echo   or Pinggy ^(temp only; not free forever^).
echo ============================================
pause
