# PF フォルダを配布するとき

## 公開してよいもの・ダメなもの

| 含めない（個人情報・秘密・機種依存） | 理由 |
|--------------------------------------|------|
| `my_aituber/.venv/` | 仮想環境は環境依存・肥大化 |
| `my_aituber/vts_token.txt` | VTube Studio のプラグイン認証トークン |
| `my_aituber/chat_history.db` | 会話ログ |
| `my_aituber/temp.wav` | 実行時に生成される音声キャッシュ |

| `my_os/target/` | Rust のビルド成果物（巨大・再現可能） |
| `my_os/.git/` | `my_os` を別リポジトリ clone した場合のネストした `.git`（PF と二重管理になるためコミットしない） |

Git を使う場合はルートの `.gitignore` が上記を除外します。

### GitHub に公開するときのチェックリスト

- **大丈夫な場合が多い:** `.gitignore` 済みのシークレットなしソース、クレジット（`CREDITS.md`）、既定の `serve.py`（127.0.0.1 のみ）。
- **確認:** `my_aituber` のトークン・DB を誤コミットしていないか、`my_os/target` がリポジトリに入っていないか。
- **`my_os` に `.git` が残っている場合:** PF をひとつのリポジトリにするなら `my_os/.git` を削除するか、サブモジュールとして明示（放置すると誤コミットの原因になります）。

## スクリプト

| ファイル | 役割 |
|---------|------|
| `package-my_aituber.sh` | `downloads/my_aituber-source.zip`（ひより AI のソースのみ・秘密情報除外） |
| `package-my_os.sh` | `downloads/my_os-source.zip`（Rust ソースのみ・`target` / `.git` 除外） |
| `package-pf-dist.sh` | `downloads/pf-portfolio-dist.zip`（ポートフォリオ一式・上記と `.venv` / `.git` など除外。**出力 ZIP 自身は同梱しない** — 再帰で異常肥大化するため） |
| `clean-my_aituber-artifacts.sh` | `chat_history.db` と `temp.wav` を削除（配布前の整理に） |

ZIP を更新したら配布物としてコミットするか、デプロイパイプラインで生成してください。

## ローカルサーバー（`serve.sh`）

- 既定は **`BIND=127.0.0.1`** のみが見える設定です（同一 LAN に自動公開しない）。
- スマホなど別端末から試すときだけ **`BIND=0.0.0.0 ./serve.sh`** を使い、信頼できるネットワークに限定してください。
- **ディレクトリ一覧は無効**です（フォルダをブラウザで列挙されません）。

## README が文字化けするとき

1. **`./serve.sh` 経由の URL**（`http://127.0.0.1:…`）で開いているか確認する。`file://` で Markdown を直接開くと、OS・ブラウザによっては HTTP の `charset` が効かず UTF-8 と誤判定されます。
2. 主要な `.md` には **UTF-8 BOM** を付けてあるので、`file://` でも表示が安定しやすくなっています。
3. サーバーは `.md` を **`Content-Type: text/plain; charset=utf-8`** で返します（`text/markdown` よりブラウザ互換が取りやすいです）。

## ライセンス・クレジット

第三者製アセット・フォントの利用条件は `CREDITS.md` を参照してください。

## 公開前チェックリスト（実施記録・2026-05-02）

1. **セキュリティ:** `vts_token.txt` 未コミット／空または不存在、`chat_history.db`・`temp.wav` 整理済み、ソースに API キー等のハードコードなし（再 grep 確認）。
2. **軽量化:** `.venv` は `.gitignore` および `package-pf-dist.sh` で除外、`my_os/target` は `cargo clean` 済み、`my_os/.git` はネスト解消済み。
3. **ZIP:** `./package-pf-dist.sh`（および `package-my_os.sh` / `package-my_aituber.sh`）で `downloads/` を更新。ZIP 内に `target/`・`.venv/`・`vts_token.txt`・`my_os/.git` が含まれないことを一覧で確認済み。
4. **表示:** ルート `README.md` の手順で `serve.sh` 起動可。プロフィール文面・`CREDITS.md` は公開用に更新済み。
5. **他人環境:** ルート `README.md` と各 `my_*/README.md` にゼロからの手順を記載。
