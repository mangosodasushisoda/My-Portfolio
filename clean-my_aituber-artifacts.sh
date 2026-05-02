#!/usr/bin/env bash
# my_aituber の実行時生成ファイルを削除（配布・公開前の整理用）
# vts_token は既定では残す（再認証が必要になるため）。完全削除は --with-token
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGET="$ROOT/my_aituber"

if [[ ! -d "$TARGET" ]]; then
  echo "my_aituber が見つかりません: $TARGET"
  exit 1
fi

rm -f "$TARGET/chat_history.db" "$TARGET/temp.wav"
echo "削除: chat_history.db, temp.wav（存在した場合）"

if [[ "${1:-}" == "--with-token" ]]; then
  rm -f "$TARGET/vts_token.txt"
  echo "削除: vts_token.txt（次回起動で VTube Studio の認証が必要になります）"
fi
