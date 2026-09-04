@echo off
title Urban Nail Bar - START SALON
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"

echo ============================================
echo   Urban Nail Bar - START SALON
echo   One-click launch (Windows)
echo ============================================
echo.
echo   Starts AI server + staff salon + public
echo   booking + public access:
echo     - Caddy domain when ports free + admin
echo     - else Tailscale Funnel ^(free *.ts.net^)
echo     - else Pinggy TEMP ^(about 60 min^)
echo   Guide: docs\GO-ONLINE-FREE.md
echo.

REM ---- Node ----
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not on PATH.
    echo Install from https://nodejs.org  then double-click this again.
    pause
    exit /b 1
)
echo [ok] Node:
node -v

REM ---- Server packages ----
if not exist "%ROOT%\server\node_modules\" (
    echo [1/6] Installing server packages...
    pushd "%ROOT%\server"
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo [1/6] Server packages already installed
)

REM ---- Caddy (permanent domain proxy) ----
echo [2/6] Ensuring Caddy...
call "%SCRIPTS%ENSURE-CADDY.bat"
if errorlevel 1 (
    echo WARNING: Caddy download failed - permanent domain may be skipped.
) else (
    echo [2/6] Caddy ready
)

REM ---- Optional assets (icons / QR) if Python available ----
where python >nul 2>&1
if not errorlevel 1 (
    if not exist "%ROOT%\assets\pwa\icon-192.png" (
        if not exist "%ROOT%\assets\icons\icon-192.png" (
            echo [3/6] Generating icons / assets...
            pip install Pillow segno reportlab -q >nul 2>&1
            python "%ROOT%\setup-assets.py"
        ) else (
            echo [3/6] Assets already present
        )
    ) else (
        echo [3/6] Assets already present
    )
) else (
    echo [3/6] Python not found - skipping asset regen (ok if assets exist)
)

echo [4/6] Starting salon + AI server (ports 3001 + 3002)...
start "Kimi AI Server - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%START-KIMI-SERVER.bat""
timeout /t 4 /nobreak >nul

echo [5/6] Opening Home + Public booking...
start "" "http://localhost:3001/index.html"
start "" "http://localhost:3002/"

set "PERMANENT_DOMAIN=urban-nail-bar.work.gd"
set "USE_PERMANENT=0"
if exist "%ROOT%\server\Caddyfile" if exist "%ROOT%\server\caddy.exe" if exist "%ROOT%\server\dnsexit.env" (
    findstr /I /C:"paste-your-api-key-here" "%ROOT%\server\dnsexit.env" >nul 2>&1
    if errorlevel 1 set "USE_PERMANENT=1"
)

echo.
echo ============================================
echo   Salon is LIVE
echo ============================================
echo.
echo   Staff / Home:     http://localhost:3001/index.html
echo   Website:          http://localhost:3001/pages/website.html
echo   In-salon Booking: http://localhost:3001/pages/booking.html
echo   Scheduler:        http://localhost:3001/pages/scheduler.html
echo   Public booking:   http://localhost:3002/
if "%USE_PERMANENT%"=="1" (
    echo.
    echo   PUBLIC DOMAIN:    https://%PERMANENT_DOMAIN%/
    echo   Website online:   https://%PERMANENT_DOMAIN%/pages/website.html
    echo   Scheduler online: https://%PERMANENT_DOMAIN%/pages/scheduler.html
    echo   Booking online:   https://%PERMANENT_DOMAIN%/booking.html
    echo   ^(Needs router 80/443 — docs\GO-ONLINE-FREE.md^)
)
echo.
echo   Default PINs: change in Admin before go-live
echo   ^(see docs\07-ROLES-AND-PINS.md^)
echo.
echo   AI tip: open any page, tap the gold Voice button,
echo   allow the mic, then ask to book / cancel / reschedule.
echo.

if "%USE_PERMANENT%"=="1" (
    net session >nul 2>&1
    if errorlevel 1 (
        echo [6/6] Permanent domain needs Administrator for ports 80/443.
        echo   Right-click START-SALON.bat → Run as administrator
        echo   after Netgear forwards 80+443 ^(docs\GO-ONLINE-FREE.md^).
        echo   Starting free tunnel instead ^(Tailscale, else Pinggy TEMP^)...
        echo.
        goto FREE_TUNNEL
    )
    echo [6/6] Starting PERMANENT domain ^(Caddy + DNS Exit DDNS^)
    echo   Keep this window AND the minimized windows open.
    echo.
    call "%SCRIPTS%FREE-PORTS-FOR-CADDY.bat"
    if errorlevel 1 (
        echo.
        echo [6/6] Cannot start Caddy until port 80 is free.
        echo   Fix steps were printed above. Or fall back to free tunnel:
        echo.
        choice /C YN /M "Start free tunnel (Tailscale / Pinggy TEMP) instead"
        if errorlevel 2 (
            pause
            exit /b 1
        )
        goto FREE_TUNNEL
    )
    start "DNS Exit DDNS - DO NOT CLOSE" /min cmd /k ""%SCRIPTS%UPDATE-DNSEXIT-IP.bat""
    start "" "https://%PERMANENT_DOMAIN%/"
    cd /d "%ROOT%\server"
    echo [6/6] Starting Caddy...
    caddy.exe run --config Caddyfile
    if errorlevel 1 (
        echo.
        echo Caddy exited with an error. If you see "forbidden by its access
        echo permissions" on :80, IIS or an excluded port range still owns it.
        echo Re-run as Administrator or see scripts\FREE-PORTS-FOR-CADDY.bat output.
        echo.
        echo If the router still blocks 80/443, use a free tunnel meanwhile:
        choice /C YN /M "Start free tunnel (Tailscale / Pinggy TEMP)"
        if errorlevel 2 (
            pause
            exit /b 1
        )
        goto FREE_TUNNEL
    )
    pause
    exit /b 0
)

:FREE_TUNNEL
echo [6/6] Opening free public tunnel ^(no port-forward^)...
echo   Prefer Tailscale Funnel; Pinggy is TEMP ~60 min only.
echo   Keep this window AND the minimized server window open.
echo.
call "%SCRIPTS%START-FREE-TUNNEL.bat"
pause
