#!/bin/bash
# Urban Nail Bar — sync all OS packages via _sync tools
set -e
PKG="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$PKG/.." && pwd)"

if [ ! -f "$ROOT/_sync/AUTO-SYNC-ALL.js" ]; then
  echo "ERROR: Salon root not found. Expected: $ROOT/_sync/AUTO-SYNC-ALL.js"
  read -r _
  exit 1
fi

echo "============================================"
echo "  Urban Nail Bar - SYNC ALL PACKAGES"
echo "============================================"
echo "  Root: $ROOT"
echo ""
echo "  [1] Sync DATA only  (hub + all OS packages)"
echo "  [2] Sync UI from Windows 11 -> Mac packages"
echo "  [3] Sync DATA + UI"
echo "  [4] Cancel"
read -r -p "Select 1-4: " CHOICE

case "$CHOICE" in
  1)
    node "$ROOT/_sync/AUTO-SYNC-ALL.js"
    ;;
  2)
    node "$ROOT/_sync/SYNC-UI-FROM-WINDOWS.js"
    ;;
  3)
    node "$ROOT/_sync/AUTO-SYNC-ALL.js"
    node "$ROOT/_sync/SYNC-UI-FROM-WINDOWS.js"
    ;;
  *)
    echo "Cancelled."
    exit 0
    ;;
esac

echo ""
echo "Done. Keep only ONE salon-server running as source of truth."
read -r _
