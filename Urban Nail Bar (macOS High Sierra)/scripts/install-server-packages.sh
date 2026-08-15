#!/bin/bash
# Install npm packages for Urban Nail Bar server (Sierra / Big Sur safe).
# Usage: sourced from START-SALON, or: install_server_packages "/path/to/salon"
# Does NOT install @cursor/sdk — salon core only needs express + cors + dotenv + node-fetch.

install_server_packages() {
  local ROOT="$1"
  local SERVER="$ROOT/server"
  if [ ! -d "$SERVER" ]; then
    echo "ERROR: server folder missing: $SERVER"
    return 1
  fi
  if [ ! -f "$SERVER/package.json" ]; then
    echo "ERROR: server/package.json missing"
    return 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm not found (install Node.js first)."
    return 1
  fi

  local NPM_MAJOR
  NPM_MAJOR="$(npm -v 2>/dev/null | cut -d. -f1)"
  NPM_MAJOR="${NPM_MAJOR:-0}"

  echo "  Checking npm registry…"
  if ! npm ping --registry https://registry.npmjs.org/ >/dev/null 2>&1; then
    echo "  WARNING: npm ping failed — will still try install (offline CDN / firewall)."
  else
    echo "  Registry reachable."
  fi

  cd "$SERVER" || return 1

  # Fail fast on DVD/ISO / locked USB (EROFS) — do not retry 3 times
  if ! ( : > "$SERVER/.unb-write-test-$$" ) 2>/dev/null; then
    echo ""
    echo "ERROR: server folder is READ-ONLY:"
    echo "  $SERVER"
    echo ""
    echo "  You are running from a CD/DVD/ISO or locked drive."
    echo "  Copy the whole 'Urban Nail Bar' folder to your Desktop,"
    echo "  then double-click START-SALON.command from that copy."
    echo ""
    return 1
  fi
  rm -f "$SERVER/.unb-write-test-$$" 2>/dev/null || true

  # Local .npmrc: never pull optional Cursor SDK; keep installs quiet
  cat > .npmrc <<'EOF'
engine-strict=false
fund=false
audit=false
optional=false
fetch-retries=5
fetch-retry-mintimeout=20000
registry=https://registry.npmjs.org/
EOF

  # Drop any previous broken Cursor SDK tree (Node 14 cannot run it)
  rm -rf node_modules/@cursor node_modules/@connectrpc node_modules/@bufbuild 2>/dev/null || true

  local ATTEMPT=1
  local MAX=3
  local OK=0

  while [ "$ATTEMPT" -le "$MAX" ]; do
    echo "  Install attempt $ATTEMPT of $MAX…"
    if [ "$NPM_MAJOR" -lt 7 ] 2>/dev/null; then
      # Node 14 ships npm 6 — cannot use lockfileVersion 3
      echo "  Legacy npm detected — installing production packages without lockfile…"
      if [ -f package-lock.json ] && [ ! -f package-lock.json.npm7 ]; then
        mv package-lock.json package-lock.json.npm7 2>/dev/null || true
      fi
      if npm install --production --no-optional --no-package-lock; then
        OK=1
        break
      fi
    else
      if npm install --omit=dev --omit=optional; then
        OK=1
        break
      fi
      echo "  Retry without lockfile…"
      if npm install --omit=dev --omit=optional --no-package-lock; then
        OK=1
        break
      fi
      echo "  Retry production-only…"
      if npm install --production --no-optional --no-package-lock; then
        OK=1
        break
      fi
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
  done

  if [ "$OK" -ne 1 ]; then
    echo "ERROR: npm install failed after $MAX attempts."
    return 1
  fi

  if [ ! -d "$SERVER/node_modules/express" ]; then
    echo "ERROR: express package missing after install."
    echo "  Delete server/node_modules and try START-SALON again."
    return 1
  fi

  echo "  OK — server packages ready (express found)."
  return 0
}
