#!/bin/bash
# ============================================================
#  AI Salon Pro — ONE START for all packages (macOS entry)
#  Double-click this file from the AI SALON PRO root folder.
#  If macOS blocks it: right-click → Open → Open
#  Windows users: double-click START-SALON.bat instead.
# ============================================================

SCRIPT_PATH="$0"
if command -v readlink >/dev/null 2>&1; then
  _rl="$(readlink "$SCRIPT_PATH" 2>/dev/null || true)"
  if [ -n "$_rl" ]; then SCRIPT_PATH="$_rl"; fi
fi
ROOT="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
cd "$ROOT" || exit 1

echo "============================================"
echo "  AI Salon Pro — START SALON"
echo "  One start for Windows / High Sierra / Big Sur"
echo "============================================"
echo ""

OS_VER="$(sw_vers -productVersion 2>/dev/null || echo unknown)"
echo "Detected macOS: $OS_VER"

PKG=""
PKG_LABEL=""

pick_high_sierra() {
  if [ -f "$ROOT/Urban Nail Bar (macOS High Sierra)/START-SALON.command" ]; then
    PKG="$ROOT/Urban Nail Bar (macOS High Sierra)/START-SALON.command"
    PKG_LABEL="macOS High Sierra"
    return 0
  fi
  if [ -f "$ROOT/Urban Nail Bar (macOS Sierra)/START-SALON.command" ]; then
    PKG="$ROOT/Urban Nail Bar (macOS Sierra)/START-SALON.command"
    PKG_LABEL="macOS High Sierra (legacy folder)"
    return 0
  fi
  return 1
}

pick_big_sur() {
  if [ -f "$ROOT/Urban Nail Bar (macOS Big Sur)/START-SALON.command" ]; then
    PKG="$ROOT/Urban Nail Bar (macOS Big Sur)/START-SALON.command"
    PKG_LABEL="macOS Big Sur"
    return 0
  fi
  return 1
}

# Pick the best package for this Mac
case "$OS_VER" in
  10.12.*|10.13.*|10.14.*|10.15.*)
    pick_high_sierra || true
    ;;
  11.*|12.*|13.*|14.*|15.*)
    pick_big_sur || pick_high_sierra || true
    if [ -n "$PKG" ] && [ "$PKG_LABEL" = "macOS High Sierra" ]; then
      PKG_LABEL="macOS High Sierra (fallback)"
    fi
    ;;
  *)
    # Unknown / newer: prefer Big Sur package, then High Sierra
    pick_big_sur || pick_high_sierra || true
    ;;
esac

# Last resort: any available Mac package
if [ -z "$PKG" ]; then
  pick_big_sur || pick_high_sierra || true
fi

if [ -z "$PKG" ]; then
  echo ""
  echo "ERROR: No Mac salon package found."
  echo "Expected one of:"
  echo "  Urban Nail Bar (macOS High Sierra)/START-SALON.command"
  echo "  Urban Nail Bar (macOS Big Sur)/START-SALON.command"
  echo ""
  echo "Press Return to close."
  read -r _
  exit 1
fi

echo "[ok] Root:    $ROOT"
echo "[ok] Package: $PKG_LABEL"
echo ""

# Backup + sync data + mirror UI across all 3 packages before launch
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi
if command -v node >/dev/null 2>&1; then
  if [ -f "$ROOT/_sync/MIRROR-ALL-THREE.js" ]; then
    echo "Backup + sync + mirror across Windows / High Sierra / Big Sur..."
    node "$ROOT/_sync/MIRROR-ALL-THREE.js" || echo "NOTE: mirror reported an error — continuing."
    echo ""
  elif [ -f "$ROOT/_sync/AUTO-SYNC-ALL.js" ]; then
    echo "Syncing shared data across all 3 systems..."
    node "$ROOT/_sync/AUTO-SYNC-ALL.js" || echo "NOTE: sync reported an error — continuing."
    echo ""
  fi
fi

chmod +x "$PKG" 2>/dev/null || true
echo "Starting $PKG_LABEL salon..."
echo ""
exec bash "$PKG"
