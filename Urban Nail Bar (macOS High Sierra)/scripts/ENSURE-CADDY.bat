@echo off
REM Download Caddy into server\caddy.exe if missing
setlocal
cd /d "%~dp0.."
set "ROOT=%CD%"
set "CADDY=%ROOT%\server\caddy.exe"

if exist "%CADDY%" (
    exit /b 0
)

echo [caddy] Downloading Caddy for Windows (amd64)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/caddyserver/caddy/releases/latest' -Headers @{ 'User-Agent' = 'UrbanNailBar' };" ^
  "$asset = $rel.assets | Where-Object { $_.name -match 'windows_amd64\.zip$' } | Select-Object -First 1;" ^
  "if (-not $asset) { throw 'No windows_amd64.zip asset found' };" ^
  "$zip = Join-Path $env:TEMP 'caddy-windows.zip';" ^
  "$dir = Join-Path $env:TEMP 'caddy-extract';" ^
  "Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip;" ^
  "if (Test-Path $dir) { Remove-Item $dir -Recurse -Force };" ^
  "Expand-Archive -Path $zip -DestinationPath $dir -Force;" ^
  "$exe = Get-ChildItem -Path $dir -Filter 'caddy.exe' -Recurse | Select-Object -First 1;" ^
  "if (-not $exe) { throw 'caddy.exe not found in zip' };" ^
  "Copy-Item $exe.FullName -Destination '%CADDY%' -Force;" ^
  "Write-Host ('[caddy] Saved ' + '%CADDY%')"

if not exist "%CADDY%" (
    echo ERROR: Failed to download caddy.exe
    exit /b 1
)
exit /b 0
