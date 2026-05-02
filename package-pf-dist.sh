#!/usr/bin/env bash
# PF ポートフォリオ一式を ZIP に固める（秘密情報・venv・git を除外）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$ROOT/downloads"
OUT_ZIP="$OUT_DIR/pf-portfolio-dist.zip"
mkdir -p "$OUT_DIR"
TMP=$(mktemp -d)
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

rsync -a \
  --exclude='downloads/pf-portfolio-dist.zip' \
  --exclude='my_aituber/.venv' \
  --exclude='my_aituber/vts_token.txt' \
  --exclude='my_aituber/chat_history.db' \
  --exclude='my_aituber/temp.wav' \
  --exclude='my_os/target' \
  --exclude='my_os/.git' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='**/__pycache__' \
  "$ROOT/" "$TMP/PF/"

rm -f "$OUT_ZIP"
( cd "$TMP" && zip -r "$OUT_ZIP" PF -q )
echo "作成: $OUT_ZIP ($(du -h "$OUT_ZIP" | awk '{print $1}'))"
