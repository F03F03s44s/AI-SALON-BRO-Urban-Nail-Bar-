@echo off
REM AI Salon Pro - one-click start (Windows)
REM Folder names with parentheses break cmd IF blocks, so this launches PowerShell.
cd /d "%~dp0" 2>nul
title AI Salon Pro - START SALON

if exist "%~dp0START-SALON.ps1" goto HAVE_PS1
echo ERROR: START-SALON.ps1 missing next to this bat.
echo Folder: %~dp0
pause
exit /b 1

:HAVE_PS1
echo Starting AI Salon Pro...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0START-SALON.ps1"
set "EC=%ERRORLEVEL%"
if "%EC%"=="0" exit /b 0
echo.
echo START returned error code %EC%
pause
exit /b %EC%
