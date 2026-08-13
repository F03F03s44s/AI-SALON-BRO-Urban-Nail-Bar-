# AI Salon Pro - ONE START (Windows PowerShell)
# Double-click START-SALON.bat / START-SALON.vbs, or right-click -> Run with PowerShell.
# 1) Backup + sync data + mirror UI across all 3 OS packages
# 2) Start salon server (High Sierra preferred)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

Write-Host '============================================'
Write-Host '  AI Salon Pro - START SALON'
Write-Host '  One-click: sync + backup + mirror + start'
Write-Host '============================================'
Write-Host ''
Write-Host "[ok] Root: $Root"

# Work package: High Sierra first (primary), then Big Sur, then Windows 11.
$candidates = @(
    (Join-Path $Root 'Urban Nail Bar (macOS High Sierra)'),
    (Join-Path $Root 'Urban Nail Bar (macOS Sierra)'),
    (Join-Path $Root 'Urban Nail Bar (macOS Big Sur)'),
    (Join-Path $Root 'Urban Nail Bar (Windows 11)')
)
$PkgDir = $null
foreach ($c in $candidates) {
    if (Test-Path -LiteralPath (Join-Path $c 'server\salon-server.js')) {
        $PkgDir = $c
        break
    }
}
if (-not $PkgDir) {
    Write-Host 'ERROR: No salon package with server\salon-server.js found.'
    Read-Host 'Press Enter to close'
    exit 1
}

$ServerDir = Join-Path $PkgDir 'server'
$MirrorJs = Join-Path $Root '_sync\MIRROR-ALL-THREE.js'
$SyncJs = Join-Path $Root '_sync\AUTO-SYNC-ALL.js'
$HubDir = Join-Path $Root '_shared-salon-data'
$HubData = Join-Path $HubDir 'data-store.json'

Write-Host "[ok] Package: $(Split-Path -Leaf $PkgDir)"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host 'ERROR: Node.js not found in PATH. Install from https://nodejs.org'
    Read-Host 'Press Enter to close'
    exit 1
}
Write-Host "[ok] Node: $(node -v)"

$syncScript = $null
if (Test-Path -LiteralPath $MirrorJs) { $syncScript = $MirrorJs }
elseif (Test-Path -LiteralPath $SyncJs) { $syncScript = $SyncJs }

if ($syncScript) {
    Write-Host ''
    Write-Host 'Backing up + syncing data + mirroring all 3 OS packages...'
    try {
        & node $syncScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host "NOTE: mirror/sync exit code $LASTEXITCODE - continuing."
        }
    } catch {
        Write-Host "NOTE: sync error - continuing. $_"
    }
    Write-Host ''
} else {
    Write-Host 'NOTE: _sync\MIRROR-ALL-THREE.js not found — continuing without mirror.'
}

$env:SALON_PRO_ROOT = $Root
if (Test-Path -LiteralPath $HubData) { $env:SALON_DATA_FILE = $HubData }

$express = Join-Path $ServerDir 'node_modules\express'
if (-not (Test-Path -LiteralPath $express)) {
    Write-Host '[1/4] Installing server packages (internet required once)...'
    Push-Location -LiteralPath $ServerDir
    try {
        & npm install --omit=dev --omit=optional --no-fund --no-audit
        if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)" }
    } finally {
        Pop-Location
    }
} else {
    Write-Host '[1/4] Server packages already installed'
}

Write-Host '[2/4] Checking port 3001...'
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "      Freed PID $($_.OwningProcess)"
        } catch {}
    }

Write-Host '[3/4] Starting salon server...'
$log = Join-Path $ServerDir 'salon-server.log'
if (Test-Path -LiteralPath $log) { Remove-Item -LiteralPath $log -Force -ErrorAction SilentlyContinue }

$p = Start-Process -FilePath 'node' -ArgumentList 'salon-server.js' `
    -WorkingDirectory $ServerDir -WindowStyle Normal -PassThru

Write-Host '[4/4] Waiting for http://127.0.0.1:3001/ ...'
$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:3001/'
        if ($r.StatusCode -ge 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Host ''
    Write-Host 'ERROR: localhost:3001 did NOT start'
    Write-Host "Server PID: $($p.Id)  HasExited: $($p.HasExited)"
    if (Test-Path -LiteralPath $log) {
        Write-Host '--- salon-server.log ---'
        Get-Content -LiteralPath $log -Tail 40
    }
    Read-Host 'Press Enter to close'
    exit 1
}

Start-Process 'http://localhost:3001/index.html'

Write-Host ''
Write-Host '============================================'
Write-Host '  Salon is LIVE'
Write-Host '============================================'
Write-Host '  Staff:   http://localhost:3001/index.html'
Write-Host '  Booking: http://localhost:3002/'
Write-Host "  Package: $(Split-Path -Leaf $PkgDir)"
Write-Host "  Hub:     $HubDir"
Write-Host "  Server PID: $($p.Id) - keep that window open."
Write-Host ''
Write-Host '  All 3 OS packages are synced (data + pages).'
Write-Host ''
Read-Host 'Press Enter to close'
