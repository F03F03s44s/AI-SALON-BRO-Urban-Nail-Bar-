#!/bin/bash
# Mirror all 3 OS packages: backup + data sync + UI newest-wins
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found."
  echo "Press Return to close."
  read -r _
  exit 1
fi
node "$SCRIPT_DIR/MIRROR-ALL-THREE.js"
echo ""
echo "Press Return to close."
read -r _
