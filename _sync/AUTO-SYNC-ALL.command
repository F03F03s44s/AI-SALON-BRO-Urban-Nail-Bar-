#!/bin/bash
# Legacy name — runs full MIRROR-ALL-THREE
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi
node "$SCRIPT_DIR/MIRROR-ALL-THREE.js"
