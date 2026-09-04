@echo off
title Urban Nail Bar - DNS Exit DDNS
cd /d "%~dp0.."
set "ROOT=%CD%"
set "ENVFILE=%ROOT%\server\dnsexit.env"

echo ============================================
echo   DNS Exit Dynamic DNS updater
echo   Keep this window open while online
echo ============================================
echo.

if not exist "%ENVFILE%" (
    echo ERROR: Missing %ENVFILE%
    echo Copy server\dnsexit.env.example to server\dnsexit.env
    echo and paste your DNS Exit API key.
    echo See docs\DNS-EXIT-DOMAIN.md
    pause
    exit /b 1
)

set "DNSEXIT_API_KEY="
set "DNSEXIT_HOST=urban-nail-bar.work.gd"
for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%ENVFILE%") do (
    if /I "%%A"=="DNSEXIT_API_KEY" set "DNSEXIT_API_KEY=%%B"
    if /I "%%A"=="DNSEXIT_HOST" set "DNSEXIT_HOST=%%B"
)

if "%DNSEXIT_API_KEY%"=="" (
    echo ERROR: DNSEXIT_API_KEY is empty in server\dnsexit.env
    pause
    exit /b 1
)
if /I "%DNSEXIT_API_KEY%"=="paste-your-api-key-here" (
    echo ERROR: Replace paste-your-api-key-here with your real DNS Exit API key.
    pause
    exit /b 1
)

echo Host: %DNSEXIT_HOST%
echo Update interval: every 5 minutes
echo.
echo If you see AUTH ERROR: create a NEW API key at
echo   https://dnsexit.com/  -^> Settings -^> DNS API Key
echo paste it into server\dnsexit.env, then restart this window.
echo Also set A record urban-nail-bar -^> your public IP in the DNS Exit panel.
echo.

:loop
echo [%DATE% %TIME%] Updating DNS Exit A record...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPDATE-DNSEXIT-IP.ps1" -EnvFile "%ENVFILE%"
echo Next update in 5 minutes. Close this window to stop DDNS.
timeout /t 300 /nobreak >nul
goto loop
