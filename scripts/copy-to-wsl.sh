#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${SOURCE_DIR:-/mnt/c/Users/HOME/fullstack-fastapi-template}"
TARGET_DIR="${TARGET_DIR:-$HOME/fullstack-fastapi-template}"

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required. Install it with: sudo apt update && sudo apt install -y rsync"
  exit 1
fi

mkdir -p "$TARGET_DIR"

rsync -av \
  --exclude='.venv/' \
  --exclude='frontend/node_modules/' \
  --exclude='.pnpm-store/' \
  --exclude='.pytest_cache/' \
  --exclude='.ruff_cache/' \
  --exclude='__pycache__/' \
  --exclude='**/__pycache__/' \
  --exclude='test.db' \
  --exclude='.git/' \
  "$SOURCE_DIR/" \
  "$TARGET_DIR/"

cat <<EOF

Copied project to:
  $TARGET_DIR

Next:
  cd "$TARGET_DIR"
  python3 -m pip install --user uv
  python3 -m uv sync --all-groups
  npm install -g pnpm
  pnpm --dir frontend install
  docker compose up -d
  python3 -m uv run app seed-local
  python3 -m uv run pytest
  python3 -m uv run fastapi dev app/main.py
EOF

