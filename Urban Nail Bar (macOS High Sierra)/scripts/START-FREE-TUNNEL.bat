@echo off
setlocal EnableDelayedExpansion
title Urban Nail Bar - Free public tunnel
cd /d "%~dp0.."
set "ROOT=%CD%"
set "SCRIPTS=%~dp0"

echo ============================================
echo   Free public tunnel ^(no port-forward^)
echo ============================================
echo.
echo   Prefer: Tailscale Funnel ^(longer-lived *.ts.net URL^)
echo   Fallback: Pinggy TEMP ^(about 60 minutes^)
echo.
echo   Permanent custom domain needs router 80/443:
echo   docs\GO-ONLINE-FREE.md + docs\DNS-EXIT-DOMAIN.md
echo   ^(NOT unlimited forever without port-forward^)
echo.

REM ---- Prefer Tailscale Funnel when installed + logged in ----
set "TS="
where tailscale >nul 2>&1
if not errorlevel 1 set "TS=tailscale"
if not defined TS if exist "%ProgramFiles%\Tailscale\tailscale.exe" set "TS=%ProgramFiles%\Tailscale\tailscale.exe"
if not defined TS if exist "%ProgramFiles(x86)%\Tailscale\tailscale.exe" set "TS=%ProgramFiles(x86)%\Tailscale\tailscale.exe"
if not defined TS if exist "%LOCALAPPDATA%\Tailscale\tailscale.exe" set "TS=%LOCALAPPDATA%\Tailscale\tailscale.exe"

if defined TS (
    "%TS%" status --json >nul 2>&1
    if not errorlevel 1 (
        echo [1/1] Tailscale is ready — starting Funnel...
        echo.
        call "%SCRIPTS%START-TAILSCALE-FUNNEL.bat"
        exit /b %ERRORLEVEL%
    )
    echo [info] Tailscale found but not logged in — trying Pinggy TEMP instead.
    echo         Sign into Tailscale, then re-run for a longer-lived URL.
    echo.
) else (
    echo [info] Tailscale not installed — using Pinggy TEMP fallback.
    echo         For a longer free URL ^(no port-forward^): install Tailscale
    echo         from https://tailscale.com/download/windows then re-run.
    echo.
)

REM ---- TEMP fallback: Pinggy via OpenSSH (~60 min) ----
where ssh >nul 2>&1
if errorlevel 1 (
    echo ERROR: No Tailscale Funnel and OpenSSH ^(ssh^) not found.
    echo.
    echo Install ONE of:
    echo   A^) Tailscale — https://tailscale.com/download/windows
    echo   B^) OpenSSH Client — Windows Optional Features
    echo   C^) Permanent domain — fix Netgear port-forward ^(docs\GO-ONLINE-FREE.md^)
    exit /b 1
)

echo Opening TEMP Pinggy tunnel ^(NOT unlimited — about 60 minutes^)...
echo.
echo   PASSWORD PROMPT: just press Enter ^(blank password^).
echo   If asked to trust the host key, type yes then Enter.
echo.
echo   After it connects, copy the https://....pinggy.link URL.
echo   That link = public booking ^(port 3002^) only.
echo   URL changes each run and may time out ~60 minutes.
echo.

ssh -p 443 -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -R0:127.0.0.1:3002 free.pinggy.io
echo.
echo Tunnel stopped.
exit /b 0
