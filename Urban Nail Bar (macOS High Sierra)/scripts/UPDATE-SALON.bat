@echo off
title Urban Nail Bar - Cache Version Update
cd /d "%~dp0.."
echo ============================================
echo   Urban Nail Bar - Cache Version Updater
echo ============================================
echo.

REM Prefer Kimi's managed Python (known to exist), fall back to system Python
set "PY=C:\Users\f03f0\AppData\Roaming\kimi-desktop\daimon-share\daimon\runtime\python\.venv\Scripts\python.exe"
if not exist "%PY%" set "PY=python"

REM Optional: pass a version tag (e.g. UPDATE-SALON.bat 20260801), default = today
"%PY%" "C:\Users\f03f0\AI\Kimi\Kimi Work\Kimi Workspace\Ai Agent Skills\Ai Agent Skills\bump_version.py" %1

echo.
echo All pages will now load the freshest code in every browser.
echo.
pause
