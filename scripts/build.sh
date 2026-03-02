#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

rsync -a \
  --exclude ".git" \
  --exclude "dist" \
  --exclude ".DS_Store" \
  "$ROOT_DIR/" "$DIST_DIR/"

echo "Build complete: $DIST_DIR"
