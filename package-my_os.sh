#!/usr/bin/env bash
# my_os を ZIP に固める（target・ネスト .git などビルド・管理用は除外）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$ROOT/downloads"
OUT_ZIP="$OUT_DIR/my_os-source.zip"
mkdir -p "$OUT_DIR"
TMP=$(mktemp -d)
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

rsync -a \
  --exclude='target' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  "$ROOT/my_os/" "$TMP/my_os/"

rm -f "$OUT_ZIP"
( cd "$TMP" && zip -r "$OUT_ZIP" my_os -q )
echo "作成: $OUT_ZIP ($(du -h "$OUT_ZIP" | awk '{print $1}'))"
