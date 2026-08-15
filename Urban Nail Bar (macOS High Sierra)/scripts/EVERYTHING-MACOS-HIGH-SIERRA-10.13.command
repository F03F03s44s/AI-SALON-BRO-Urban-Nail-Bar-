#!/bin/bash
# Urban Nail Bar - EVERYTHING for macOS High Sierra 10.13
# Double-click in Finder. First time if needed:
#   chmod +x "EVERYTHING-MACOS-HIGH-SIERRA-10.13.command"
#   then right-click -> Open

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "============================================"
echo "  Urban Nail Bar - EVERYTHING"
echo "  macOS High Sierra 10.13 - one click"
echo "============================================"
echo ""

OS_VER="$(sw_vers -productVersion 2>/dev/null || echo unknown)"
echo "Detected macOS: $OS_VER"
case "$OS_VER" in
  10.13.*) ;;
  *)
    echo "NOTE: Tuned for High Sierra 10.13 - you are on $OS_VER."
    echo ""
    ;;
esac

export PATH="/usr/local/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  echo "ERROR: Node.js not found."
  echo "On High Sierra install Node 14.21.3 (safest) or Node 16.20.2:"
  echo "  https://nodejs.org/download/release/v14.21.3/"
  echo "  file: node-v14.21.3.pkg"
  echo "Press Return to close."
  read -r _
  exit 1
fi

NODE_MAJOR="$("$NODE_BIN" -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
echo "[ok] Node: $("$NODE_BIN" -v)"
if [ "$NODE_MAJOR" -ge 17 ] 2>/dev/null; then
  echo "WARNING: Node $NODE_MAJOR is usually too new for High Sierra."
  echo "         Use Node 14.21.3 or 16.20.2 if the server crashes."
  echo ""
fi

if [ ! -d "$ROOT/server/node_modules" ]; then
  echo "[1/6] Installing server packages..."
  (cd "$ROOT/server" && npm install) || {
    echo "ERROR: npm install failed."
    read -r _
    exit 1
  }
else
  echo "[1/6] Server packages already installed"
fi

if command -v ssh >/dev/null 2>&1; then
  echo "[2/6] OpenSSH present (Pinggy TEMP tunnel ready — ~60 min)"
else
  echo "[2/6] WARNING: ssh not found — temp public tunnel will be skipped."
  echo "  Local staff + booking still work."
fi

if command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
  PY="$(command -v python3 || command -v python)"
  if [ ! -f "$ROOT/assets/icons/icon-192.png" ] && [ -f "$ROOT/setup-assets.py" ]; then
    echo "[3/6] Generating icons / assets..."
    "$PY" -m pip install Pillow segno reportlab -q >/dev/null 2>&1 || true
    "$PY" "$ROOT/setup-assets.py" || true
  else
    echo "[3/6] Assets already present (or skip)"
  fi
else
  echo "[3/6] Python not found - skipping asset regen"
fi

for PORT in 3001 3002; do
  PIDS="$(lsof -ti tcp:$PORT 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo "Freeing port $PORT..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done

echo "[4/6] Starting salon server (ports 3001 + 3002)..."
osascript <<APPLESCRIPT
tell application "Terminal"
  activate
  do script "cd \"$ROOT/server\" && echo 'Kimi AI Server - DO NOT CLOSE' && node kimi-proxy-server.js"
end tell
APPLESCRIPT

echo "[5/6] Waiting for server, then opening pages..."
READY=0
i=0
while [ $i -lt 20 ]; do
  if curl -fsS "http://127.0.0.1:3001/" >/dev/null 2>&1; then
    READY=1
    break
  fi
  i=$((i + 1))
  sleep 1
done
if [ "$READY" -ne 1 ]; then
  echo "WARNING: Server not responding yet - opening pages anyway."
fi

open "http://localhost:3001/index.html"
open "http://localhost:3002/"

echo "[6/6] Opening TEMP Pinggy tunnel (NOT unlimited — about 60 minutes)..."
echo ""
echo "  Keep BOTH Terminal windows open."
echo "  PASSWORD PROMPT: press Enter (blank password)."
echo "  Copy the https://....pinggy.link URL shown below."
echo "  Permanent custom domain needs Windows Caddy + router 80/443."
echo "  Staff:  http://localhost:3001"
echo "  Public: http://localhost:3002 (+ tunnel)"
echo ""

if ! command -v ssh >/dev/null 2>&1; then
  echo "Tunnel skipped - OpenSSH (ssh) missing."
  echo "Local sites are open. Press Return to close."
  read -r _
  exit 0
fi

ssh -p 443 -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -R0:127.0.0.1:3002 free.pinggy.io
echo ""
echo "Tunnel stopped. Press Return to close."
read -r _
