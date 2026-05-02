#!/usr/bin/env python3
"""
Unity WebGL 用の静的サーバー。
標準の `python -m http.server` だと .unityweb の MIME が環境によって
application/gzip になり、ブラウザが先に解凍してしまい
「Unable to parse ... framework.js.unityweb / Content-Encoding」の原因になることがあります。
ここでは .unityweb を常に application/octet-stream で返します。
.md は text/plain; charset=utf-8 で返す（ブラウザ・Safari での表示安定のため）。
"""

from __future__ import annotations

import errno
import http
import http.server
import os
import socketserver

PORT = int(os.environ.get("PORT", "5500"))
# 既定はこのマシンのみ（LAN から見えない）。同一ネットワークに公開する場合のみ BIND=0.0.0.0
BIND = os.environ.get("BIND", "127.0.0.1")
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class UnityHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update(
        {
            ".unityweb": "application/octet-stream",
            ".wasm": "application/wasm",
            ".js": "application/javascript",
            ".json": "application/json",
            ".data": "application/octet-stream",
            ".zip": "application/zip",
        }
    )

    def guess_type(self, path: str):
        # 親クラスは MIME 文字列のみを返す（タプルではない）。タプルを返すと
        # Content-Type が "('application/octet-stream', None)" のようになり、
        # Unity が .unityweb を壊れたデータとして解釈する。
        p = (path.split("?", 1)[0] if "?" in path else path).lower()
        if p.endswith(".unityweb") or ".framework.js.unityweb" in p:
            return "application/octet-stream"
        if p.endswith(".wasm"):
            return "application/wasm"
        # README 等: charset は必須。text/markdown は Safari 等が charset を無視したり別扱いすることがあるため
        # ブラウザ内表示は text/plain の方が UTF-8 が安定する。
        if p.endswith(".md"):
            return "text/plain; charset=utf-8"
        if p.endswith(".txt"):
            return "text/plain; charset=utf-8"
        return super().guess_type(path)

    def list_directory(self, path):
        """ディレクトリ一覧 HTML を返さない（フォルダ構成の丸見え防止）。"""
        self.send_error(http.HTTPStatus.FORBIDDEN, "Directory listing is disabled")
        return None


class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True


def main() -> None:
    ThreadingHTTPServer.allow_reuse_address = True
    try:
        httpd = ThreadingHTTPServer((BIND, PORT), UnityHTTPRequestHandler)
    except OSError as e:
        if e.errno == errno.EADDRINUSE:
            print(
                f"エラー: ポート {PORT} は既に使われています。"
                f" 別のターミナルのサーバーを止めるか、次のように番号を変えてください:\n"
                f"  PORT=8080 ./serve.sh"
            )
        else:
            print(f"サーバーを起動できませんでした: {e}")
        raise SystemExit(1) from e

    url = f"http://127.0.0.1:{PORT}/"
    with httpd:
        print(f"PF を {url} で配信中（Unity 向け MIME 設定済み）。")
        if BIND not in ("127.0.0.1", "::1"):
            print(f"注意: BIND={BIND} のため同一 LAN などからアクセス可能です。")
        else:
            print("同一ネットワークからも見せる場合: BIND=0.0.0.0 を指定（信頼できる環境のみ）。")
        print("ブラウザでは必ず http:// を使ってください（https:// では開けません）。")
        print("終了は Ctrl+C。")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n停止しました。")


if __name__ == "__main__":
    main()
