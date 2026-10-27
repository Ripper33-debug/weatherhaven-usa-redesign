#!/usr/bin/env bash
# One-time setup for this redesign copy.
# 1. Copies the existing photos and media from your original project into ./public
#    (read-only on the original; files that already exist here are never overwritten).
# 2. Installs dependencies.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ORIGINAL="${1:-$HOME/weatherhaven-special-forces-may}"

if [ ! -d "$ORIGINAL/public" ]; then
  echo "Couldn't find $ORIGINAL/public."
  echo "Run it with the path to your original project, e.g.: bash finish-setup.sh ~/path/to/weatherhaven-special-forces-may"
  exit 1
fi
if [ "$(cd "$ORIGINAL" && pwd)" = "$HERE" ]; then
  echo "This script must be run from the redesign copy, not the original project."
  exit 1
fi

echo "Copying media from $ORIGINAL/public (the original is only read)..."
mkdir -p "$HERE/public"
rsync -a --ignore-existing "$ORIGINAL/public/" "$HERE/public/"

echo "Installing dependencies..."
cd "$HERE"
npm install

echo
echo "Done. Start the site with:  npm run dev   then open http://localhost:3000"
