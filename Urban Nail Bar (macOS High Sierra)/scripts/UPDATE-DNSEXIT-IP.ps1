param(
  [Parameter(Mandatory = $false)]
  [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"

function Parse-DnsExitJson {
  param([string]$Raw)
  if (-not $Raw) { return $null }
  if ($Raw -match '\{[\s\S]*\}') {
    try { return ($Matches[0] | ConvertFrom-Json) } catch { return $null }
  }
  return $null
}

if (-not $EnvFile) {
  $EnvFile = Join-Path (Split-Path $PSScriptRoot -Parent) "server\dnsexit.env"
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "  FAIL: missing $EnvFile"
  exit 1
}

$key = ""
$hostName = "urban-nail-bar.work.gd"
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match '^\s*DNSEXIT_API_KEY=(.*)$') { $key = $Matches[1].Trim() }
  if ($_ -match '^\s*DNSEXIT_HOST=(.*)$') { $hostName = $Matches[1].Trim() }
}

if (-not $key -or $key -eq "paste-your-api-key-here") {
  Write-Host "  FAIL: DNSEXIT_API_KEY missing or still placeholder in dnsexit.env"
  exit 1
}

try {
  $pub = (Invoke-RestMethod -Uri "https://api.ipify.org?format=json" -TimeoutSec 15).ip
} catch {
  Write-Host ("  FAIL: could not read public IP: " + $_.Exception.Message)
  exit 1
}

Write-Host ("  This PC public IP: " + $pub)

# Documented form POST: curl .../ud/?apikey=KEY -d host=HOST -d ip=IP
$udUrl = "https://api.dnsexit.com/dns/ud/?apikey=" + [uri]::EscapeDataString($key)
$udOk = $false
$udBody = $null
try {
  $r = Invoke-WebRequest -Uri $udUrl -Method POST -Body @{ host = $hostName; ip = $pub } -UseBasicParsing -TimeoutSec 25
  $udBody = ($r.Content | Out-String).Trim()
} catch {
  Write-Host ("  UD endpoint FAIL: " + $_.Exception.Message)
}

$parsed = Parse-DnsExitJson -Raw $udBody
if ($parsed -and ($null -ne $parsed.code)) {
  Write-Host ("  DNS Exit UD: code=$($parsed.code) message=$($parsed.message)")
  if ([int]$parsed.code -eq 0 -or [int]$parsed.code -eq 1) {
    $udOk = $true
  } elseif ([int]$parsed.code -eq 2) {
    Write-Host "  AUTH ERROR: API key rejected. Create a new key at DNS Exit Settings,"
    Write-Host "  paste into server\dnsexit.env, and also set the A record manually."
  }
} elseif ($udBody -eq "{}" -or [string]::IsNullOrWhiteSpace($udBody)) {
  Write-Host "  DNS Exit UD returned empty {} - usually a bad/expired API key or host not in this account."
  Write-Host "  Fix: DNS Exit dashboard -> Settings -> DNS API Key (new key) -> paste into dnsexit.env"
  Write-Host ("  AND set A record host 'urban-nail-bar' -> " + $pub)
} else {
  Write-Host ("  DNS Exit UD raw: " + $udBody)
}

# JSON update for hosted DNS on work.gd
$shortName = $hostName
if ($hostName -like "*.work.gd") {
  $shortName = $hostName.Substring(0, $hostName.Length - ".work.gd".Length)
  $domain = "work.gd"
} elseif ($hostName -match '^([^.]+)\.(.+)$') {
  $shortName = $Matches[1]
  $domain = $Matches[2]
} else {
  $domain = $hostName
  $shortName = ""
}

$payloadObj = @{
  apikey = $key
  domain = $domain
  update = @{
    type      = "A"
    name      = $shortName
    content   = $pub
    ttl       = 5
    overwrite = $true
  }
}
$payload = $payloadObj | ConvertTo-Json -Compress -Depth 6

try {
  $jr = Invoke-WebRequest -Uri "https://api.dnsexit.com/dns/" `
    -Method POST -ContentType "application/json; charset=utf-8" `
    -Body $payload -UseBasicParsing -TimeoutSec 25
  $jraw = ($jr.Content | Out-String).Trim()
  $jp = Parse-DnsExitJson -Raw $jraw
  if ($jp -and ($null -ne $jp.code)) {
    Write-Host ("  DNS Exit JSON update: code=$($jp.code) message=$($jp.message)")
    if ([int]$jp.code -eq 0) { $udOk = $true }
    if ([int]$jp.code -eq 2) {
      Write-Host "  AUTH ERROR on JSON API - key in dnsexit.env is wrong for this account."
    }
  } else {
    Write-Host ("  DNS Exit JSON raw: " + $jraw)
  }
} catch {
  Write-Host ("  JSON update FAIL: " + $_.Exception.Message)
}

try {
  $resolved = Resolve-DnsName -Name $hostName -Type A -Server 8.8.8.8 -ErrorAction Stop |
    Select-Object -ExpandProperty IPAddress -First 1
  Write-Host ("  Public DNS (8.8.8.8) now: " + $resolved)
  if ($resolved -ne $pub) {
    Write-Host ("  MISMATCH: DNS still points elsewhere. Until A record = " + $pub + ", the domain will not reach this PC.")
    if (-not $udOk) {
      Write-Host ("  Open https://dnsexit.com/ -> DNS for work.gd -> edit A 'urban-nail-bar' -> " + $pub)
    }
  } else {
    Write-Host "  DNS matches this PC. Good."
  }
} catch {
  Write-Host ("  Could not resolve " + $hostName + " : " + $_.Exception.Message)
}

if (-not $udOk) { exit 2 }
exit 0
