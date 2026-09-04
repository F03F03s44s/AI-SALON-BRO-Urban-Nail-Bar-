#!/bin/bash
# Urban Nail Bar - EVERYTHING for macOS Big Sur 11.7.10
# Double-click in Finder. First time if needed:
#   chmod +x "EVERYTHING-MACOS-BIG-SUR-11.7.10.command"
#   then right-click -> Open

set -e
# scripts/ lives one level under the repo root
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "============================================"
echo "  Urban Nail Bar - EVERYTHING"
echo "  macOS Big Sur 11.7.10 - one click"
echo "============================================"
echo ""

OS_VER="$(sw_vers -productVersion 2>/dev/null || echo unknown)"
echo "Detected macOS: $OS_VER"
case "$OS_VER" in
  11.*) ;;
  *)
    echo "NOTE: Tuned for Big Sur 11.7.10 - you are on $OS_VER."
    echo ""
    ;;
esac

export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  echo "ERROR: Node.js not found."
  echo "On Big Sur 11.7.10 install Node 18 LTS:"
  echo "  https://nodejs.org/dist/latest-v18.x/"
  echo "  or: brew install node@18"
  echo "Press Return to close."
  read -r _
  exit 1
fi

echo "[ok] Node: $("$NODE_BIN" -v)"

# 1) npm
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

# 2) Public tunnel tools (Tailscale Funnel preferred; Pinggy TEMP fallback)
if command -v tailscale >/dev/null 2>&1; then
  echo "[2/6] Tailscale present (Funnel preferred for free public URL)"
elif command -v ssh >/dev/null 2>&1; then
  echo "[2/6] OpenSSH present (Pinggy TEMP ~60 min fallback ready)"
else
  echo "[2/6] WARNING: no Tailscale or ssh — temp public tunnel will be skipped."
  echo "  Local staff + booking still work. Install Tailscale or use Caddy on Windows."
fi

# 3) assets (optional)
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

# free ports
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
while [ $i -lt 25 ]; do
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

echo "[6/6] Opening free public tunnel (not the permanent domain)..."
echo "  Prefer Tailscale Funnel (*.ts.net). Pinggy is TEMP ~60 min only."
echo "  Permanent custom domain needs Windows Caddy + router 80/443."
echo "  Keep BOTH Terminal windows open."
echo "  Staff:  http://localhost:3001"
echo "  Public: http://localhost:3002 (+ tunnel)"
echo ""

if command -v tailscale >/dev/null 2>&1 && tailscale status >/dev/null 2>&1; then
  echo "Starting Tailscale Funnel → port 3002..."
  echo "Copy the https://....ts.net URL shown below."
  echo ""
  tailscale funnel --yes 3002 || true
  echo ""
  echo "Funnel stopped. Press Return to close."
  read -r _
  exit 0
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "Tunnel skipped - install Tailscale or OpenSSH (ssh)."
  echo "Local sites are open. Press Return to close."
  read -r _
  exit 0
fi

echo "Opening TEMP Pinggy tunnel (NOT unlimited — about 60 minutes)..."
echo "  PASSWORD PROMPT: press Enter (blank password)."
echo "  Copy the https://....pinggy.link URL shown below."
echo ""
ssh -p 443 -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -R0:127.0.0.1:3002 free.pinggy.io
echo ""
echo "Tunnel stopped. Press Return to close."
read -r _
