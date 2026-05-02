# ポートフォリオ（PF）

自己紹介・作品紹介の静的サイトと、関連ソースの ZIP です。

## サイトを見る（ゼロから）

1. [Python 3](https://www.python.org/) が入っていることを確認する。
2. このフォルダで:

```bash
./serve.sh
```

3. 表示された URL（既定は `http://127.0.0.1:5500/`。`PORT` で変更可）をブラウザで開く。`index.html` がトップです。

配布ポリシー・含めてはいけないファイルは **`DISTRIBUTION.md`**。第三者素材の表記は **`CREDITS.md`**。

## 同梱プロジェクトを別途動かす

| 内容 | 手順 |
|------|------|
| **ひより AI（Python）** | `my_aituber/README.md`（`python3 -m venv .venv` → `pip install -r requirements.txt`） |
| **my_os（Rust）** | `my_os/README.md`（`rustup`・`bootimage`・`cargo bootimage`） |

ソースのみの ZIP は `downloads/` 内（`package-*.sh` で再生成）。
