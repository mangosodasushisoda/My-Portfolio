#!/bin/bash
# ダブルクリックでローカルサーバー起動＆ブラウザを開きます（macOS）
set -e
cd "$(dirname "$0")"
export PORT="${PORT:-5500}"

# 応答なし (ERR_EMPTY_RESPONSE) を防ぐ: サーバーが実際に応答してから open する
python3 "$(dirname "$0")/serve.py" &
PID=$!

ok=0
for _ in {1..40}; do
  if curl -sf -o /dev/null --connect-timeout 1 "http://127.0.0.1:${PORT}/"; then
    ok=1
    break
  fi
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "サーバーが起動直後に終了しました。上のエラーを確認してください。"
    exit 1
  fi
  sleep 0.15
done

if [ "$ok" -ne 1 ]; then
  echo "起動確認がタイムアウトしました（ポート ${PORT}）。別アプリがポートを占有している可能性があります。"
  kill "$PID" 2>/dev/null || true
  exit 1
fi

open "http://127.0.0.1:${PORT}/index.html"
echo "サーバー PID ${PID} — 終了はこのウィンドウで Ctrl+C"
wait "$PID"
