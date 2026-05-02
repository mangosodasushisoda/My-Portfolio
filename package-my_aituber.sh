#!/usr/bin/env bash
# my_aituber を ZIP に固める（公開配布用。認証・個人データは含めない）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$ROOT/downloads"
OUT_ZIP="$OUT_DIR/my_aituber-source.zip"
mkdir -p "$OUT_DIR"
TMP=$(mktemp -d)
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

rsync -a \
  --exclude='.venv' \
  --exclude='vts_token.txt' \
  --exclude='chat_history.db' \
  --exclude='temp.wav' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.DS_Store' \
  "$ROOT/my_aituber/" "$TMP/my_aituber/"

rm -f "$OUT_ZIP"
( cd "$TMP" && zip -r "$OUT_ZIP" my_aituber -q )
echo "作成: $OUT_ZIP ($(du -h "$OUT_ZIP" | awk '{print $1}'))"
