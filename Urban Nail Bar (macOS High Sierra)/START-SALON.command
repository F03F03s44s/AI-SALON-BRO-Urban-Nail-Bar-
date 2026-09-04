#!/bin/bash
# Urban Nail Bar — START SALON (macOS High Sierra 10.13)
# Double-click this file INSIDE the salon folder (preferred).
# If macOS blocks it: right-click → Open → Open
#
# Do NOT use set -e — writable tests and optional tools must not abort the launcher.
# Server is started with nohup (NOT AppleScript) — paths with spaces/parens break osascript.

SCRIPT_PATH="$0"
if command -v readlink >/dev/null 2>&1; then
  _rl="$(readlink "$SCRIPT_PATH" 2>/dev/null || true)"
  if [ -n "$_rl" ]; then SCRIPT_PATH="$_rl"; fi
fi
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

echo "============================================"
echo "  Urban Nail Bar — START SALON"
echo "  macOS High Sierra 10.13"
echo "============================================"
echo ""

OS_VER="$(sw_vers -productVersion 2>/dev/null || echo unknown)"
echo "Detected macOS: $OS_VER"
case "$OS_VER" in
  10.13.*) ;;
  *)
    echo "NOTE: Tuned for High Sierra 10.13 — you are on $OS_VER."
    echo ""
    ;;
esac

unb_is_writable() {
  local dir="$1"
  [ -n "$dir" ] || return 1
  [ -d "$dir" ] || return 1
  local f="$dir/.unb-write-test-$$"
  if ( : > "$f" ) 2>/dev/null; then
    rm -f "$f" 2>/dev/null || true
    return 0
  fi
  return 1
}

unb_looks_like_salon() {
  local dir="$1"
  [ -f "$dir/server/salon-server.js" ] && [ -f "$dir/index.html" ]
}

unb_looks_like_pro_root() {
  local dir="$1"
  [ -n "$dir" ] && [ -d "$dir" ] || return 1
  if [ -d "$dir/_shared-salon-data" ]; then return 0; fi
  local hits=0
  [ -f "$dir/Urban Nail Bar (Windows 11)/server/salon-server.js" ] && hits=$((hits + 1))
  { [ -f "$dir/Urban Nail Bar (macOS High Sierra)/server/salon-server.js" ] || [ -f "$dir/Urban Nail Bar (macOS Sierra)/server/salon-server.js" ]; } && hits=$((hits + 1))
  [ -f "$dir/Urban Nail Bar (macOS Big Sur)/server/salon-server.js" ] && hits=$((hits + 1))
  [ "$hits" -ge 2 ]
}

unb_find_pro_root() {
  local start="$1"
  local cur="$start"
  local i
  for i in 1 2 3 4 5 6 7 8; do
    if unb_looks_like_pro_root "$cur"; then echo "$cur"; return 0; fi
    local parent
    parent="$(cd "$cur/.." 2>/dev/null && pwd)" || break
    [ "$parent" = "$cur" ] && break
    cur="$parent"
  done
  local c
  for c in \
    "$HOME/Desktop/Urban Nail Bar" \
    "$HOME/Desktop/URBAN NAIL BAR/Urban Nail Bar" \
    "$HOME/Desktop/URBAN NAIL BAR" \
    "$HOME/Documents/Urban Nail Bar" \
    "$HOME/Documents/URBAN NAIL BAR/Urban Nail Bar" \
    "/Volumes/URBAN NAIL BAR/Urban Nail Bar" \
    "/Volumes/URBAN NAIL BAR"
  do
    if unb_looks_like_pro_root "$c"; then echo "$c"; return 0; fi
  done
  return 1
}

unb_find_salon_root() {
  local start="$1"
  local pro
  pro="$(unb_find_pro_root "$start" || true)"
  if [ -n "$pro" ] && unb_looks_like_salon "$pro/Urban Nail Bar (macOS High Sierra)"; then
    echo "$pro/Urban Nail Bar (macOS High Sierra)"
    return 0
  fi
  if [ -n "$pro" ] && unb_looks_like_salon "$pro/Urban Nail Bar (macOS Sierra)"; then
    echo "$pro/Urban Nail Bar (macOS Sierra)"
    return 0
  fi
  if unb_looks_like_salon "$start"; then
    echo "$start"
    return 0
  fi
  local c
  for c in \
    "$HOME/Desktop/Urban Nail Bar/Urban Nail Bar (macOS High Sierra)" \
    "$HOME/Desktop/URBAN NAIL BAR/Urban Nail Bar/Urban Nail Bar (macOS High Sierra)" \
    "$HOME/Desktop/Urban Nail Bar (macOS High Sierra)" \
    "$HOME/Documents/Urban Nail Bar (macOS High Sierra)" \
    "$SCRIPT_DIR/Urban Nail Bar (macOS High Sierra)" \
    "$SCRIPT_DIR"
  do
    if unb_looks_like_salon "$c"; then
      echo "$c"
      return 0
    fi
  done
  local d
  for d in "$HOME/Desktop"/*; do
    [ -d "$d" ] || continue
    if unb_looks_like_salon "$d"; then
      echo "$d"
      return 0
    fi
  done
  return 1
}

# Push critical launcher files onto an existing Desktop copy (USB/DVD updates).
unb_refresh_dest_launchers() {
  local src="$1"
  local dest="$2"
  [ -d "$src" ] && [ -d "$dest" ] || return 0
  local f
  for f in START-SALON.command setup-assets.py HOW-TO-START.txt; do
    if [ -f "$src/$f" ]; then
      cp "$src/$f" "$dest/$f" 2>/dev/null || true
    fi
  done
  if [ -f "$src/server/salon-server.js" ]; then
    cp "$src/server/salon-server.js" "$dest/server/salon-server.js" 2>/dev/null || true
  fi
  if [ -f "$src/server/package.json" ]; then
    cp "$src/server/package.json" "$dest/server/package.json" 2>/dev/null || true
  fi
  if [ -f "$src/server/.npmrc" ]; then
    cp "$src/server/.npmrc" "$dest/server/.npmrc" 2>/dev/null || true
  fi
  if [ -f "$src/scripts/install-server-packages.sh" ]; then
    mkdir -p "$dest/scripts" 2>/dev/null || true
    # Strip CR — Windows CRLF breaks bash on Sierra ("syntax error near `{")
    tr -d '\r' < "$src/scripts/install-server-packages.sh" > "$dest/scripts/install-server-packages.sh" 2>/dev/null \
      || cp "$src/scripts/install-server-packages.sh" "$dest/scripts/install-server-packages.sh" 2>/dev/null \
      || true
  fi
  chmod +x "$dest/START-SALON.command" 2>/dev/null || true
  chmod +x "$dest/scripts/"*.sh 2>/dev/null || true
}

# Copy salon files off locked disc/USB. Never copy .git — disc permissions
# often block nested .git/objects ("Operation not permitted") and git is not
# required to run the salon.
unb_rsync_tree() {
  local src="$1"
  local dest="$2"
  [ -e "$src" ] || return 1
  mkdir -p "$dest" 2>/dev/null || return 1
  if [ -d "$src" ]; then
    rsync -a \
      --exclude='.git' \
      --exclude='.git/**' \
      --exclude='**/.git' \
      --exclude='**/.git/**' \
      --exclude='.DS_Store' \
      "$src/" "$dest/" 2>/dev/null
    return $?
  fi
  cp -f "$src" "$dest" 2>/dev/null
}

# Full AI SALON PRO tree → Desktop (Mac packages + hub + sync only).
# Skips Windows 11 (sync-only on Mac) and all .git folders.
unb_copy_pro_to_desktop() {
  local src="$1"
  local dest="$2"
  local item
  local pkg
  local ok=0

  mkdir -p "$dest" 2>/dev/null || return 1
  echo "  (excluding .git and Windows 11 — not needed to run on Mac)"

  if ! command -v rsync >/dev/null 2>&1; then
    echo "ERROR: rsync not found — cannot safely copy from locked disc."
    echo "  Install Xcode Command Line Tools, or copy the folder manually to Desktop."
    return 1
  fi

  for item in \
    _shared-salon-data \
    _sync \
    START-SALON.command \
    START-SALON.bat \
    START-SALON.ps1 \
    START-SALON.vbs \
    HOW-TO-START.txt \
    README.md
  do
    if [ -e "$src/$item" ]; then
      if [ -d "$src/$item" ]; then
        unb_rsync_tree "$src/$item" "$dest/$item" && ok=1
      else
        cp -f "$src/$item" "$dest/$item" 2>/dev/null && ok=1
      fi
    fi
  done

  for pkg in \
    "Urban Nail Bar (macOS High Sierra)" \
    "Urban Nail Bar (macOS Big Sur)" \
    "Urban Nail Bar (macOS Sierra)"
  do
    if [ -d "$src/$pkg" ]; then
      echo "  … $pkg"
      if unb_rsync_tree "$src/$pkg" "$dest/$pkg"; then
        ok=1
      else
        echo "  WARNING: partial copy of $pkg"
      fi
      # Belt-and-suspenders: drop any .git that slipped through
      find "$dest/$pkg" -name '.git' -type d -prune -exec rm -rf {} + 2>/dev/null || true
    fi
  done

  [ "$ok" -eq 1 ]
}

unb_copy_package_to_desktop() {
  local src="$1"
  local dest="$2"
  if ! command -v rsync >/dev/null 2>&1; then
    echo "ERROR: rsync not found — cannot safely copy from locked disc."
    return 1
  fi
  mkdir -p "$dest" 2>/dev/null || return 1
  unb_rsync_tree "$src" "$dest" || return 1
  find "$dest" -name '.git' -type d -prune -exec rm -rf {} + 2>/dev/null || true
  return 0
}

ROOT="$(unb_find_salon_root "$SCRIPT_DIR" || true)"
if [ -z "$ROOT" ]; then
  echo ""
  echo "============================================"
  echo "  SALON FOLDER NOT FOUND"
  echo "============================================"
  echo "  This launcher was started from:"
  echo "    $SCRIPT_DIR"
  echo ""
  echo "  Copy the WHOLE \"Urban Nail Bar\" folder to Desktop,"
  echo "  open Urban Nail Bar (macOS High Sierra), then double-click"
  echo "  START-SALON.command inside that folder."
  echo ""
  echo "Press Return to close."
  read -r _
  exit 1
fi

cd "$ROOT" || exit 1
echo "[ok] Salon folder: $ROOT"
echo ""

PRO_ROOT="$(unb_find_pro_root "$ROOT" || true)"
if [ -z "$PRO_ROOT" ] && [ -d "$ROOT/../_shared-salon-data" ]; then
  PRO_ROOT="$(cd "$ROOT/.." && pwd)"
fi

# Read-only disc/USB → copy whole Urban Nail Bar (or solo package fallback)
if ! unb_is_writable "$ROOT" || ! unb_is_writable "$ROOT/server"; then
  echo ""
  echo "============================================"
  echo "  READ-ONLY LOCATION DETECTED"
  echo "============================================"
  echo "  Salon is on a locked disc/USB:"
  echo "    $ROOT"
  echo ""
  mkdir -p "$HOME/Desktop" 2>/dev/null || true
  if [ -n "$PRO_ROOT" ] && unb_looks_like_pro_root "$PRO_ROOT"; then
    DEST_PRO="$HOME/Desktop/Urban Nail Bar"
    DEST="$DEST_PRO/Urban Nail Bar (macOS High Sierra)"
    echo "  Copying Mac salon tree to Desktop (keeps shared hub)…"
    echo "    → $DEST_PRO"
    echo ""
    if [ -d "$DEST" ] && unb_looks_like_salon "$DEST" && unb_is_writable "$DEST/server"; then
      echo "  Writable copy already exists — refreshing launchers from disc/USB…"
      unb_refresh_dest_launchers "$ROOT" "$DEST"
      exec bash "$DEST/START-SALON.command"
    fi
    # Remove a previous half-failed copy so we do not start broken
    if [ -d "$DEST_PRO" ] && ! unb_looks_like_salon "$DEST"; then
      echo "  Removing incomplete Desktop copy from a previous failed attempt…"
      rm -rf "$DEST_PRO" 2>/dev/null || true
    fi
    mkdir -p "$DEST_PRO" 2>/dev/null || {
      echo "ERROR: Cannot create $DEST_PRO"
      echo "Press Return to close."
      read -r _
      exit 1
    }
    if ! unb_copy_pro_to_desktop "$PRO_ROOT" "$DEST_PRO"; then
      echo ""
      echo "ERROR: Copy from locked disc failed."
      echo "  Tip: manually drag \"AI SALON PRO\" to Desktop, then run START-SALON there."
      echo "Press Return to close."
      read -r _
      exit 1
    fi
    xattr -cr "$DEST_PRO" 2>/dev/null || true
    chmod +x "$DEST/START-SALON.command" 2>/dev/null || true
    chmod +x "$DEST/scripts/"*.sh 2>/dev/null || true
    if ! unb_looks_like_salon "$DEST"; then
      echo "ERROR: Copy failed — salon files missing on Desktop."
      echo "Press Return to close."
      read -r _
      exit 1
    fi
    if ! unb_is_writable "$DEST/server"; then
      echo "ERROR: Desktop copy is still not writable."
      echo "Press Return to close."
      read -r _
      exit 1
    fi
    echo "  Copy complete. Starting salon from Desktop…"
    echo ""
    exec bash "$DEST/START-SALON.command"
  fi

  DEST="$HOME/Desktop/Urban Nail Bar (macOS High Sierra)"
  echo "  WARNING: Full Urban Nail Bar tree not found nearby."
  echo "  Copying this package only → $DEST"
  echo ""
  if [ -d "$DEST" ] && unb_looks_like_salon "$DEST" && unb_is_writable "$DEST/server"; then
    echo "  Writable copy already exists — refreshing launchers from disc/USB…"
    unb_refresh_dest_launchers "$ROOT" "$DEST"
    exec bash "$DEST/START-SALON.command"
  fi
  mkdir -p "$DEST" 2>/dev/null || {
    echo "ERROR: Cannot create $DEST"
    echo "Press Return to close."
    read -r _
    exit 1
  }
  if ! unb_copy_package_to_desktop "$ROOT" "$DEST"; then
    echo "ERROR: Package copy from locked disc failed."
    echo "Press Return to close."
    read -r _
    exit 1
  fi
  xattr -cr "$DEST" 2>/dev/null || true
  chmod +x "$DEST/START-SALON.command" 2>/dev/null || true
  chmod +x "$DEST/scripts/"*.sh 2>/dev/null || true
  if [ -n "$PRO_ROOT" ]; then
    printf '%s\n' "$PRO_ROOT" > "$DEST/.salon-pro-root" 2>/dev/null || true
  fi
  echo "  Copy complete. Starting salon from Desktop…"
  echo ""
  exec bash "$DEST/START-SALON.command"
fi

xattr -cr "$ROOT" 2>/dev/null || true
chmod +x "$ROOT/START-SALON.command" 2>/dev/null || true
chmod +x "$ROOT/scripts/"*.sh 2>/dev/null || true

export PATH="/usr/local/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
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
echo "[ok] Node: $("$NODE_BIN" -v)  ($NODE_BIN)"
if [ "$NODE_MAJOR" -ge 17 ] 2>/dev/null; then
  echo "WARNING: Node $NODE_MAJOR is usually too new for High Sierra."
  echo "         Use Node 14.21.3 if the server crashes."
  echo ""
fi

if [ ! -f "$ROOT/server/salon-server.js" ]; then
  echo "ERROR: server/salon-server.js missing in $ROOT"
  echo "Press Return to close."
  read -r _
  exit 1
fi

# Install / verify server packages
if [ -f "$ROOT/scripts/install-server-packages.sh" ]; then
  # shellcheck disable=SC1091
  . "$ROOT/scripts/install-server-packages.sh"
else
  echo "ERROR: scripts/install-server-packages.sh missing."
  echo "Press Return to close."
  read -r _
  exit 1
fi

NEED_INSTALL=0
if [ ! -d "$ROOT/server/node_modules/express" ]; then
  NEED_INSTALL=1
fi
# Force clean reinstall if a previous run pulled Cursor SDK on Node 14
if [ -d "$ROOT/server/node_modules/@cursor" ] && [ "$NODE_MAJOR" -lt 22 ] 2>/dev/null; then
  echo "[1/5] Removing incompatible @cursor packages (need Node 22+; salon does not require them)…"
  rm -rf "$ROOT/server/node_modules/@cursor" "$ROOT/server/node_modules/@connectrpc" "$ROOT/server/node_modules/@bufbuild" 2>/dev/null || true
  NEED_INSTALL=1
fi

if [ "$NEED_INSTALL" -eq 1 ]; then
  echo "[1/5] Installing server packages (internet required once)…"
  if ! install_server_packages "$ROOT"; then
    echo "Press Return to close."
    read -r _
    exit 1
  fi
else
  echo "[1/5] Server packages already installed"
fi

if [ ! -d "$ROOT/server/node_modules/express" ]; then
  echo "ERROR: express still missing after install — cannot start server."
  echo "Press Return to close."
  read -r _
  exit 1
fi

if command -v ssh >/dev/null 2>&1; then
  echo "[2/5] OpenSSH present (optional public tunnel)"
else
  echo "[2/5] ssh not found — local staff + booking still work"
fi

# Prefer python3 — Sierra system python is often 2.7 and cannot run this script.
if command -v python3 >/dev/null 2>&1; then
  PY="$(command -v python3)"
  if [ ! -f "$ROOT/assets/icons/icon-192.png" ] && [ ! -f "$ROOT/assets/pwa/icon-192.png" ] && [ -f "$ROOT/setup-assets.py" ]; then
    echo "[3/5] Generating icons / assets..."
    "$PY" -m pip install Pillow segno reportlab -q >/dev/null 2>&1 || true
    "$PY" "$ROOT/setup-assets.py" || echo "  (asset regen failed — continuing; salon still works)"
  else
    echo "[3/5] Assets ready"
  fi
else
  echo "[3/5] python3 not found — skipping asset regen (non-fatal)"
fi

if [ -z "$PRO_ROOT" ] && [ -f "$ROOT/.salon-pro-root" ]; then
  PRO_ROOT="$(tr -d '\r\n' < "$ROOT/.salon-pro-root" 2>/dev/null || true)"
fi
if [ -z "$PRO_ROOT" ]; then
  PRO_ROOT="$(unb_find_pro_root "$ROOT" || true)"
fi
if [ -z "$PRO_ROOT" ] && [ -d "$ROOT/../_shared-salon-data" ]; then
  PRO_ROOT="$(cd "$ROOT/.." && pwd)"
fi

echo "Backup + sync + mirror across Windows / High Sierra / Big Sur..."
if [ -n "$PRO_ROOT" ] && [ -f "$PRO_ROOT/_sync/MIRROR-ALL-THREE.js" ]; then
  "$NODE_BIN" "$PRO_ROOT/_sync/MIRROR-ALL-THREE.js" || true
elif [ -n "$PRO_ROOT" ] && [ -f "$PRO_ROOT/_sync/AUTO-SYNC-ALL.js" ]; then
  "$NODE_BIN" "$PRO_ROOT/_sync/AUTO-SYNC-ALL.js" || true
elif [ -f "$ROOT/../_sync/MIRROR-ALL-THREE.js" ]; then
  "$NODE_BIN" "$ROOT/../_sync/MIRROR-ALL-THREE.js" || true
elif [ -f "$ROOT/../_sync/AUTO-SYNC-ALL.js" ]; then
  "$NODE_BIN" "$ROOT/../_sync/AUTO-SYNC-ALL.js" || true
else
  echo "NOTE: MIRROR-ALL-THREE not found — server will still mirror when hub is reachable."
fi

unset SALON_PRO_ROOT SALON_DATA_FILE
if [ -n "$PRO_ROOT" ] && [ -d "$PRO_ROOT/_shared-salon-data" ]; then
  export SALON_PRO_ROOT="$PRO_ROOT"
  echo "[ok] Shared hub: $SALON_PRO_ROOT"
fi
if [ -n "$PRO_ROOT" ] && [ -f "$PRO_ROOT/_shared-salon-data/data-store.json" ]; then
  export SALON_DATA_FILE="$PRO_ROOT/_shared-salon-data/data-store.json"
  echo "[ok] Data file: $SALON_DATA_FILE"
elif [ -f "$ROOT/../_shared-salon-data/data-store.json" ]; then
  export SALON_PRO_ROOT="$(cd "$ROOT/.." && pwd)"
  export SALON_DATA_FILE="$SALON_PRO_ROOT/_shared-salon-data/data-store.json"
  echo "[ok] Data file: $SALON_DATA_FILE"
fi

SERVER_DIR="$ROOT/server"

# Stop stale salon on 3001/3002 (gentle then force)
if [ -f "$SERVER_DIR/salon-server.pid" ]; then
  OLD_PID="$(tr -d ' \r\n' < "$SERVER_DIR/salon-server.pid" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ]; then
    echo "Stopping previous salon server (PID $OLD_PID)..."
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
    kill -9 "$OLD_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_DIR/salon-server.pid" 2>/dev/null || true
fi
for PORT in 3001 3002; do
  PIDS="$(lsof -ti tcp:$PORT 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo "Freeing port $PORT..."
    # shellcheck disable=SC2086
    kill $PIDS 2>/dev/null || true
    sleep 1
    # shellcheck disable=SC2086
    kill -9 $PIDS 2>/dev/null || true
  fi
done

echo "[4/5] Starting salon server (ports 3001 + 3002)..."
# nohup + absolute node path — avoids AppleScript -2741 on paths with spaces/parens
export PATH="/usr/local/bin:/opt/local/bin:$PATH"
if [ ! -d "$SERVER_DIR/node_modules/express" ]; then
  echo "ERROR: express is missing — cannot start server."
  echo "  Delete $SERVER_DIR/node_modules and re-run START-SALON."
  echo "Press Return to close."
  read -r _
  exit 1
fi
if ! ( cd "$SERVER_DIR" && "$NODE_BIN" --check salon-server.js ) >>"$SERVER_DIR/salon-server.log" 2>&1; then
  echo "ERROR: salon-server.js failed syntax check."
  echo "  Log: $SERVER_DIR/salon-server.log"
  tail -n 40 "$SERVER_DIR/salon-server.log" 2>/dev/null || true
  echo "Press Return to close."
  read -r _
  exit 1
fi
(
  cd "$SERVER_DIR" || exit 1
  : >> salon-server.log
  echo "" >> salon-server.log
  echo "==== START $(date) node=$NODE_BIN ====" >> salon-server.log
  nohup "$NODE_BIN" salon-server.js >> salon-server.log 2>&1 &
  echo $! > salon-server.pid
)
SERVER_PID="$(tr -d ' \r\n' < "$SERVER_DIR/salon-server.pid" 2>/dev/null || true)"
if [ -z "$SERVER_PID" ]; then
  echo "ERROR: Failed to launch salon-server.js"
  echo "Press Return to close."
  read -r _
  exit 1
fi
echo "  Server PID: $SERVER_PID"
echo "  Log: $SERVER_DIR/salon-server.log"

echo "[5/5] Waiting for http://127.0.0.1:3001/ …"
READY=0
i=0
while [ $i -lt 40 ]; do
  if curl -fsS --connect-timeout 1 "http://127.0.0.1:3001/" >/dev/null 2>&1; then
    READY=1
    break
  fi
  # Fallback if curl missing (rare on Sierra with Xcode CLT)
  if command -v nc >/dev/null 2>&1; then
    if nc -z 127.0.0.1 3001 >/dev/null 2>&1; then
      READY=1
      break
    fi
  fi
  # Abort early if process already died
  if [ -n "$SERVER_PID" ] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "  Server process exited early."
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo ""
  echo "============================================"
  echo "  ERROR: localhost:3001 did NOT start"
  echo "============================================"
  echo "  The salon is NOT live."
  echo "  Log file: $SERVER_DIR/salon-server.log"
  echo "  --- last 40 lines ---"
  if [ -f "$SERVER_DIR/salon-server.log" ]; then
    tail -n 40 "$SERVER_DIR/salon-server.log" 2>/dev/null || true
  else
    echo "  (no log file)"
  fi
  echo "  ---------------------"
  echo ""
  echo "  Quick fix:"
  echo "    1) Delete folder: $SERVER_DIR/node_modules"
  echo "    2) Double-click START-SALON.command again"
  echo "    3) Confirm Node is 14.21.3 on Sierra"
  echo ""
  echo "Press Return to close."
  read -r _
  exit 1
fi

open "http://localhost:3001/index.html"
open "http://localhost:3002/"

echo ""
echo "============================================"
echo "  Salon is LIVE"
echo "============================================"
echo "  Staff:   http://localhost:3001/index.html"
echo "  Booking: http://localhost:3002/"
echo "  Server runs in the background (PID $SERVER_PID)."
echo "  To stop: kill $SERVER_PID"
echo "  Log:     $SERVER_DIR/salon-server.log"
echo "  Folder:  $ROOT"
if [ -n "$SALON_PRO_ROOT" ]; then
  echo "  Hub:     $SALON_PRO_ROOT"
fi
echo ""

# Optional tunnel — must NEVER block or fail the salon. Sierra OpenSSH is old:
# do NOT use StrictHostKeyChecking=accept-new (unsupported).
if ! command -v ssh >/dev/null 2>&1; then
  echo "Optional public tunnel skipped (no ssh). Local salon is fine."
  echo "Press Return to close."
  read -r _
  exit 0
fi

echo "Optional public tunnel (NOT required — local staff/booking already work)."
echo "  Press Ctrl+C to skip anytime."
echo "  At password prompt: press Enter (blank password)."
echo ""
ssh -p 443 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no \
  -R0:127.0.0.1:3002 free.pinggy.io 2>/dev/null || \
  echo "  Tunnel skipped or unavailable (OK — keep using localhost)."
echo ""
echo "Press Return to close."
read -r _
