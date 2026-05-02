#!/usr/bin/env bash
# PF フォルダで HTTP サーバーを起動します（Unity WebGL はこれが必須です）。
cd "$(dirname "$0")"
export PORT="${PORT:-5500}"
# 既定はこの PC のみ（LAN 公開しない）。別端末から見せるときだけ例: BIND=0.0.0.0 ./serve.sh
echo "PF を http://127.0.0.1:${PORT}/ で配信中です（既定 BIND=127.0.0.1）。"
echo "ブラウザで上記 URL を開いてください。終了は Ctrl+C。"
exec python3 "$(dirname "$0")/serve.py"
