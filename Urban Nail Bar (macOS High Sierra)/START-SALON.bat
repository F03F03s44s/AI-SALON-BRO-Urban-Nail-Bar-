@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Urban Nail Bar - START SALON

REM ============================================================
REM  Urban Nail Bar (Windows 11) — START SALON
REM  Do NOT require "cd" into this folder (parentheses paths can
REM  return "Access is denied" on some Windows setups).
REM  Everything uses absolute paths + start /D / npm --prefix.
REM ============================================================

set "ROOT=%~dp0"
if "!ROOT:~-1!"=="\" set "ROOT=!ROOT:~0,-1!"
set "SERVER_DIR=!ROOT!\server"
set "SYNC_JS=!ROOT!\..\_sync\MIRROR-ALL-THREE.js"
if not exist "!SYNC_JS!" set "SYNC_JS=!ROOT!\..\_sync\AUTO-SYNC-ALL.js"
set "HUB_DIR=!ROOT!\..\_shared-salon-data"
set "HUB_DATA=!ROOT!\..\_shared-salon-data\data-store.json"
set "SERVER_LOG=!SERVER_DIR!\salon-server.log"

echo ============================================
echo   Urban Nail Bar - START SALON
echo   Windows 11
echo ============================================
echo.

if not exist "!ROOT!\index.html" (
  echo ERROR: index.html missing - incomplete folder copy.
  echo Expected: !ROOT!\index.html
  pause
  exit /b 1
)
if not exist "!SERVER_DIR!\salon-server.js" (
  echo ERROR: server\salon-server.js missing - incomplete folder copy.
  pause
  exit /b 1
)
if not exist "!SERVER_DIR!\package.json" (
  echo ERROR: server\package.json missing - cannot install packages.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found in PATH.
  echo Install Node.js from https://nodejs.org then re-run.
  pause
  exit /b 1
)

echo [ok] Salon folder: !ROOT!
for /f "tokens=*" %%v in ('node -v 2^>nul') do echo [ok] Node: %%v

echo Backup + sync + mirror across Windows / High Sierra / Big Sur...
if exist "!SYNC_JS!" (
  node "!SYNC_JS!"
  if errorlevel 1 echo NOTE: mirror/sync returned an error - continuing anyway.
) else (
  echo NOTE: MIRROR-ALL-THREE.js not found - server will still mirror when hub is reachable.
)

set "SALON_PRO_ROOT="
set "SALON_DATA_FILE="
if exist "!HUB_DIR!" set "SALON_PRO_ROOT=!ROOT!\.."
if exist "!HUB_DATA!" set "SALON_DATA_FILE=!HUB_DATA!"
if defined SALON_PRO_ROOT echo [ok] Shared hub: !SALON_PRO_ROOT!
if defined SALON_DATA_FILE echo [ok] Data file: !SALON_DATA_FILE!

if not exist "!SERVER_DIR!\node_modules\express\" (
  echo [1/4] Installing server packages ^(internet required once^)...
  call npm.cmd install --prefix "!SERVER_DIR!" --omit=dev --omit=optional --no-fund --no-audit
  if errorlevel 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
) else (
  echo [1/4] Server packages already installed
)

if not exist "!SERVER_DIR!\node_modules\express\" (
  echo ERROR: express still missing after install - cannot start server.
  echo Expected: !SERVER_DIR!\node_modules\express
  pause
  exit /b 1
)

echo [2/4] Checking port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr LISTENING') do (
  echo       Freeing PID %%a on :3001
  taskkill /F /PID %%a >nul 2>&1
)

echo [3/4] Starting salon server...
if exist "!SERVER_LOG!" del /f /q "!SERVER_LOG!" >nul 2>&1

REM Env SALON_PRO_ROOT / SALON_DATA_FILE are inherited by the new process.
start "Salon Server" /D "!SERVER_DIR!" cmd /k "node salon-server.js"

echo [4/4] Waiting for http://127.0.0.1:3001/ ...
set "READY=0"
for /L %%i in (1,1,40) do (
  if "!READY!"=="0" (
    powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://127.0.0.1:3001/; if($r.StatusCode -ge 200){exit 0}else{exit 1} } catch { exit 1 }" >nul 2>&1
    if not errorlevel 1 set "READY=1"
  )
  if "!READY!"=="0" timeout /t 1 /nobreak >nul
)

if not "!READY!"=="1" (
  echo.
  echo ============================================
  echo   ERROR: localhost:3001 did NOT start
  echo ============================================
  echo   The salon is NOT live.
  echo   Check the Salon Server window for the crash.
  if exist "!SERVER_LOG!" (
    echo.
    echo   --- salon-server.log ---
    type "!SERVER_LOG!"
    echo   --- end log ---
  ) else (
    echo   Tip: read the messages in the Salon Server window.
  )
  echo.
  pause
  exit /b 1
)

start "" "http://localhost:3001/index.html"

echo.
echo ============================================
echo   Salon is LIVE
echo ============================================
echo   Staff:   http://localhost:3001/index.html
echo   Booking: http://localhost:3002/
echo   Keep the Salon Server window open.
echo.
pause
endlocal
