@echo off
title Urban Nail Bar - Sync All Packages
cd /d "%~dp0.."
set "PKG=%CD%"
set "ROOT=%CD%\.."
if not exist "%ROOT%\_sync\AUTO-SYNC-ALL.js" (
    echo ERROR: Salon root not found. Expected sibling packages under AI SALON PRO.
    echo Looking for: %ROOT%\_sync\AUTO-SYNC-ALL.js
    pause
    exit /b 1
)

echo ============================================
echo   Urban Nail Bar - SYNC ALL PACKAGES
echo ============================================
echo.
echo   Root: %ROOT%
echo.
echo   [1] Sync DATA only  (hub + all OS packages)
echo   [2] Sync UI from Windows 11 -^> Mac packages
echo   [3] Sync DATA + UI
echo   [4] Cancel
choice /c 1234 /n /m "Select 1-4: "
if errorlevel 4 goto :eof
if errorlevel 3 goto BOTH
if errorlevel 2 goto UI
if errorlevel 1 goto DATA

:DATA
echo.
echo Syncing shared salon data across all packages...
node "%ROOT%\_sync\AUTO-SYNC-ALL.js"
goto DONE

:UI
echo.
echo Syncing UI from Windows 11 to Mac packages...
node "%ROOT%\_sync\SYNC-UI-FROM-WINDOWS.js"
goto DONE

:BOTH
echo.
echo Syncing DATA then UI...
node "%ROOT%\_sync\AUTO-SYNC-ALL.js"
node "%ROOT%\_sync\SYNC-UI-FROM-WINDOWS.js"
goto DONE

:DONE
echo.
echo Done. Keep only ONE salon-server running as source of truth.
pause
