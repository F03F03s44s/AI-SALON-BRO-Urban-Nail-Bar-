@echo off
REM Legacy name — runs full MIRROR-ALL-THREE (all packages, newest wins)
cd /d "%~dp0\.." 2>nul
node "%~dp0MIRROR-ALL-THREE.js"
echo.
pause
