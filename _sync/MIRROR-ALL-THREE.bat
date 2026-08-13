@echo off
REM Mirror all 3 OS packages: backup + data sync + UI newest-wins
cd /d "%~dp0\.." 2>nul
title Urban Nail Bar - MIRROR ALL THREE
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found in PATH.
  pause
  exit /b 1
)
node "%~dp0MIRROR-ALL-THREE.js"
echo.
pause
