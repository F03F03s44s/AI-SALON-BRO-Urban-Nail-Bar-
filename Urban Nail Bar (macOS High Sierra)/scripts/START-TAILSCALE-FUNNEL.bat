@echo off
setlocal EnableDelayedExpansion
title Urban Nail Bar - Tailscale Funnel
cd /d "%~dp0.."
set "ROOT=%CD%"

echo ============================================
echo   Tailscale Funnel - free public URL
echo   ^(no router port-forward needed^)
echo ============================================
echo.
echo   Exposes public booking on port 3002.
echo   URL looks like: https://YOUR-PC.YOUR-TAILNET.ts.net/
echo.
echo   REAL LIMITS ^(be honest^):
echo   - Free on Tailscale Personal; Funnel has bandwidth caps
echo   - Personal plan is marketed for non-commercial use
echo   - NOT your custom domain ^(not urban-nail-bar.work.gd^)
echo   - PC + Tailscale must stay on while clients book
echo   - For unlimited forever + custom domain: fix router
echo     ^(docs\GO-ONLINE-FREE.md^)
echo.

set "TS="
where tailscale >nul 2>&1
if not errorlevel 1 set "TS=tailscale"
if not defined TS if exist "%ProgramFiles%\Tailscale\tailscale.exe" set "TS=%ProgramFiles%\Tailscale\tailscale.exe"
if not defined TS if exist "%ProgramFiles(x86)%\Tailscale\tailscale.exe" set "TS=%ProgramFiles(x86)%\Tailscale\tailscale.exe"
if not defined TS if exist "%LOCALAPPDATA%\Tailscale\tailscale.exe" set "TS=%LOCALAPPDATA%\Tailscale\tailscale.exe"

if not defined TS (
    echo ERROR: Tailscale is not installed.
    echo.
    echo   1^) Install: https://tailscale.com/download/windows
    echo   2^) Open Tailscale, sign in ^(free Personal account^)
    echo   3^) Re-run this script or GO-PUBLIC.bat
    echo.
    echo Meanwhile you can use TEMP Pinggy ^(about 60 min^)
    echo via scripts\START-FREE-TUNNEL.bat
    exit /b 2
)

echo [ok] Tailscale: %TS%
"%TS%" status --json >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Tailscale is installed but not logged in / not running.
    echo Open the Tailscale app from the system tray and sign in,
    echo then re-run this script.
    exit /b 3
)

echo.
echo Starting Funnel → http://127.0.0.1:3002
echo Keep this window open. Copy the https://....ts.net URL below.
echo.
echo First run may open a browser to enable Funnel + HTTPS
echo in the Tailscale admin console — approve it, then re-run if needed.
echo.

REM Modern CLI: funnel <port> proxies that local TCP port over HTTPS :443
"%TS%" funnel --yes 3002
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
    echo.
    echo Funnel failed ^(exit %RC%^). Common fixes:
    echo   - Enable MagicDNS + HTTPS Certificates in Tailscale admin
    echo   - Approve Funnel when the browser prompt appears
    echo   - Update Tailscale to latest
    echo   - Docs: https://tailscale.com/docs/features/tailscale-funnel
    echo.
    exit /b %RC%
)

echo.
echo Funnel stopped.
exit /b 0
