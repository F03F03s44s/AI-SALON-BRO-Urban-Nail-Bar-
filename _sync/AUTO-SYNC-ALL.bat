@echo off
REM Legacy name — runs full MIRROR-ALL-THREE
cd /d "%~dp0\.." 2>nul
node "%~dp0MIRROR-ALL-THREE.js"
if errorlevel 1 pause
