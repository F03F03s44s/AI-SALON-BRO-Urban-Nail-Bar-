@echo off
REM Free TCP 80/443 so Caddy can bind (Let's Encrypt + HTTPS).
REM Call before: caddy.exe run --config Caddyfile
REM Exit 0 = ports usable; Exit 1 = still blocked (message printed).
REM
REM Also stops a leftover caddy.exe that already holds 80/443 so a fresh
REM RUN-PERMANENT-TUNNEL can start cleanly (old script treated that as failure).

setlocal EnableExtensions EnableDelayedExpansion
set "NEED_FREE=0"

echo.
echo [ports] Checking TCP 80 / 443 for Caddy...

REM --- Admin required to stop IIS / bind privileged ports ---
net session >nul 2>&1
if errorlevel 1 (
    echo [ports] ERROR: Not running as Administrator.
    echo   Right-click START-SALON.bat or RUN-PERMANENT-TUNNEL.bat
    echo   -^> Run as administrator
    exit /b 1
)

REM Stop leftover Caddy first (common when re-running permanent domain)
tasklist /FI "IMAGENAME eq caddy.exe" 2>nul | findstr /I "caddy.exe" >nul 2>&1
if not errorlevel 1 (
    echo [ports] Stopping leftover caddy.exe so ports can be rebound...
    taskkill /F /IM caddy.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -ano 2>nul | findstr /R /C:":80 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    set "NEED_FREE=1"
    echo [ports] LISTENING on :80 -
    netstat -ano 2>nul | findstr /R /C:":80 .*LISTENING"
)
netstat -ano 2>nul | findstr /R /C:":443 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    set "NEED_FREE=1"
    echo [ports] LISTENING on :443 -
    netstat -ano 2>nul | findstr /R /C:":443 .*LISTENING"
)

if "!NEED_FREE!"=="0" (
    echo [ports] OK: 80 and 443 look free.
    goto :WARN_EXCLUDED
)

echo [ports] Port 80 and/or 443 is busy or reserved.
echo [ports] Stopping IIS / MultiPoint / leftover listeners...

call :STOP_SVC W3SVC
call :STOP_SVC WAS

REM MultiPoint also registers HTTP.sys URLs on :80 on some PCs
sc query Wms >nul 2>&1
if not errorlevel 1 (
    sc query Wms | findstr /I "RUNNING" >nul 2>&1
    if not errorlevel 1 (
        echo [ports] MultiPoint Service ^(Wms^) is running - stopping it...
        call :STOP_SVC Wms
    )
)

REM Kill any remaining non-system PIDs on 80/443 (not PID 4)
call :KILL_PORT_PIDS 80
call :KILL_PORT_PIDS 443

timeout /t 2 /nobreak >nul

set "STILL_BLOCKED=0"
netstat -ano 2>nul | findstr /R /C:":80 .*LISTENING" >nul 2>&1
if not errorlevel 1 set "STILL_BLOCKED=1"
netstat -ano 2>nul | findstr /R /C:":443 .*LISTENING" >nul 2>&1
if not errorlevel 1 set "STILL_BLOCKED=1"

if "!STILL_BLOCKED!"=="0" (
    echo [ports] OK: Freed 80/443. IIS stays stopped until you start it again
    echo         or reboot ^(W3SVC is usually Automatic^).
    echo         To restart IIS later:  Start-Service W3SVC
    goto :WARN_EXCLUDED
)

echo.
echo ============================================
echo   ERROR: Port 80/443 still blocked
echo ============================================
echo.
echo   Caddy cannot listen on :80. Exact Windows error is usually:
echo     bind: An attempt was made to access a socket in a way
echo     forbidden by its access permissions.
echo.
echo   Run these in an elevated PowerShell ^(copy-paste^):
echo.
echo     Stop-Service W3SVC -Force -ErrorAction SilentlyContinue
echo     Stop-Service WAS -Force -ErrorAction SilentlyContinue
echo     Stop-Service Wms -Force -ErrorAction SilentlyContinue
echo     taskkill /F /IM caddy.exe
echo     Get-Service W3SVC,WAS,Wms ^| Format-Table Name,Status
echo     netstat -ano ^| findstr ":80 "
echo     netsh interface ipv4 show excludedportrange protocol=tcp
echo.
echo   If you still see LISTENING on :80 with PID 4, find the HTTP.sys
echo   reservation:
echo     netsh http show servicestate view=requestq
echo.
echo   If port 80 is inside an "excluded port range" ^(Hyper-V / WinNAT^):
echo     1. As Admin ^(often needs reboot or WinNAT bounce^):
echo        net stop winnat
echo        netsh int ipv4 delete excludedportrange protocol=tcp startport=80 numberofports=1
echo        net start winnat
echo.
echo   Then re-run START-SALON / RUN-PERMANENT-TUNNEL as Administrator.
echo.
exit /b 1

:WARN_EXCLUDED
REM Port 80 alone in excluded ranges often causes the same "forbidden" bind error
netsh interface ipv4 show excludedportrange protocol=tcp 2>nul | findstr /R /C:"[ ]*80[ ]*80" >nul 2>&1
if not errorlevel 1 (
    echo [ports] WARNING: TCP port 80 is in Windows excludedportrange.
    echo         If Caddy still fails to bind after this, run elevated:
    echo           netsh interface ipv4 show excludedportrange protocol=tcp
    echo           net stop winnat
    echo           netsh int ipv4 delete excludedportrange protocol=tcp startport=80 numberofports=1
    echo           net start winnat
)
exit /b 0

:STOP_SVC
sc query "%~1" >nul 2>&1
if errorlevel 1 exit /b 0
sc query "%~1" | findstr /I "RUNNING" >nul 2>&1
if errorlevel 1 exit /b 0
echo [ports] Stopping %~1...
net stop "%~1" /y >nul 2>&1
if errorlevel 1 (
    powershell -NoProfile -Command "Stop-Service -Name '%~1' -Force -ErrorAction SilentlyContinue" >nul 2>&1
)
sc query "%~1" | findstr /I "STOPPED" >nul 2>&1
if not errorlevel 1 (
    echo [ports] Stopped %~1
) else (
    echo [ports] WARNING: Could not confirm %~1 stopped.
)
exit /b 0

:KILL_PORT_PIDS
REM Kill non-system PIDs listening on the given port (skip PID 4 = HTTP.sys)
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr /R /C:":%~1 .*LISTENING"') do (
    if not "%%P"=="0" if not "%%P"=="4" (
        echo [ports] Ending PID %%P on port %~1...
        taskkill /F /PID %%P >nul 2>&1
    )
)
exit /b 0
