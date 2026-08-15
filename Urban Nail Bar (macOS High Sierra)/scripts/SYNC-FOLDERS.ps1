param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Dest,
    [switch]$Bidirectional
)

$ErrorActionPreference = 'Stop'

$excludeDirNames = @(
    'node_modules', '.git', '.cursor', 'agent-transcripts', 'agent-tools', 'terminals'
)
$excludeFileNames = @(
    '_patch-scheduler-launch.js',
    # Keep each folder's platform-specific entry docs
    'README.md',
    'HOW-TO-START.md',
    'HOW-TO-USE.md'
)

function ShouldSkip([System.IO.FileInfo]$file, [string]$root) {
    $rel = $file.FullName.Substring($root.Length).TrimStart('\', '/')
    $parts = $rel -split '[\\/]'
    foreach ($p in $parts) {
        if ($excludeDirNames -contains $p) { return $true }
    }
    if ($excludeFileNames -contains $file.Name) { return $true }
    return $false
}

function SyncOneWay([string]$from, [string]$to, [bool]$newerOnly) {
    $copied = 0
    $skipped = 0
    Get-ChildItem -Path $from -Recurse -File -Force | ForEach-Object {
        if (ShouldSkip $_ $from) { $skipped++; return }
        $rel = $_.FullName.Substring($from.Length).TrimStart('\', '/')
        $target = Join-Path $to $rel
        $targetDir = Split-Path $target -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        $doCopy = $true
        if (Test-Path $target) {
            $srcHash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
            $dstHash = (Get-FileHash $target -Algorithm SHA256).Hash
            if ($srcHash -eq $dstHash) { $doCopy = $false }
            elseif ($newerOnly -and $_.LastWriteTime -le (Get-Item $target).LastWriteTime) { $doCopy = $false }
        }
        if ($doCopy) {
            Copy-Item -LiteralPath $_.FullName -Destination $target -Force
            Write-Host "  + $rel"
            $copied++
        }
    }
    Write-Host "Copied $copied file(s) ($skipped skipped by filter) from:"
    Write-Host "  $from"
    Write-Host "  -> $to"
}

if (-not (Test-Path $Source)) { throw "Source missing: $Source" }
if (-not (Test-Path $Dest)) { throw "Dest missing: $Dest" }

Write-Host "Source: $Source"
Write-Host "Dest:   $Dest"
Write-Host ""

if ($Bidirectional) {
    SyncOneWay $Source $Dest $true
    SyncOneWay $Dest $Source $true
} else {
    SyncOneWay $Source $Dest $false
}

Write-Host ""
Write-Host "IMPORTANT - live salon data:"
Write-Host "  Only ONE computer should run the Node server as the source of truth."
Write-Host "  Phones / other PCs connect to that server (LAN or public URL)."
Write-Host "  Do not run two separate servers and expect bookings to stay merged."
