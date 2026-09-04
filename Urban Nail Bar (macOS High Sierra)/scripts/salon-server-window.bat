@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Urban Nail Bar - Salon Server

set "SCRIPT_DIR=%~dp0"
if "!SCRIPT_DIR:~-1!"=="\" set "SCRIPT_DIR=!SCRIPT_DIR:~0,-1!"
set "SERVER_DIR=!SCRIPT_DIR!\..\server"
cd /d "!SERVER_DIR!"
if errorlevel 1 (
  echo ERROR: Could not cd to server folder.
  echo Expected: !SERVER_DIR!
  pause
  exit /b 1
)

if not defined SALON_PRO_ROOT (
  if exist "!SCRIPT_DIR!\..\..\_shared-salon-data" set "SALON_PRO_ROOT=!SCRIPT_DIR!\..\.."
)
if not defined SALON_DATA_FILE (
  if exist "!SCRIPT_DIR!\..\..\_shared-salon-data\data-store.json" set "SALON_DATA_FILE=!SCRIPT_DIR!\..\..\_shared-salon-data\data-store.json"
)

set "SERVER_LOG=!CD!\salon-server.log"

echo ============================================
echo   Urban Nail Bar - Salon Server
echo ============================================
echo.
echo Folder: !CD!
if defined SALON_PRO_ROOT echo SALON_PRO_ROOT=!SALON_PRO_ROOT!
if defined SALON_DATA_FILE echo SALON_DATA_FILE=!SALON_DATA_FILE!
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found in PATH.
  pause
  exit /b 1
)

if not exist "salon-server.js" (
  echo ERROR: salon-server.js missing in !CD!
  pause
  exit /b 1
)

if not exist "node_modules\express" (
  echo ERROR: express not installed. Run START-SALON.bat first.
  pause
  exit /b 1
)

echo Checking port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo Starting server on http://localhost:3001 ...
echo KEEP THIS WINDOW OPEN while using the salon.
echo.

node --check salon-server.js
if errorlevel 1 (
  echo ERROR: salon-server.js failed syntax check.
  pause
  exit /b 1
)

echo Starting salon-server.js at %DATE% %TIME%>"!SERVER_LOG!"
node salon-server.js
set "EXITCODE=!ERRORLEVEL!"
echo.>>"!SERVER_LOG!"
echo Server exited with code !EXITCODE! at %DATE% %TIME%>>"!SERVER_LOG!"
echo.
echo --------------------------------------------
echo Server stopped or crashed ^(exit !EXITCODE!^).
echo Check this window or: !SERVER_LOG!
pause
endlocal