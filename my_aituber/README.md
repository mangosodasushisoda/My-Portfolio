# ひよりAIシステム（my_aituber）

コンソールから対話し、ローカル LLM・VOICEVOX・VTube Studio と連携して VTuber「ひより」として応答する Python スクリプトです。

## Web（ポートフォリオ）からのダウンロード

`serve.sh` でサイトを表示しているとき、`downloads/my_aituber-source.zip` からソース一式を取得できます。

- ZIP には **`vts_token.txt` は入っていません**（公開配布で他人のトークンが漏れないようにするため）。初回実行時に VTube Studio が認証を求め、各自の環境で自動作成されます。
- ZIP を更新したら、PF フォルダのルートで `./package-my_aituber.sh` を実行してください。
- PF 全体の配布ポリシーはリポジトリ直下の **`DISTRIBUTION.md`** を参照してください。

## 配布前にローカルだけ片付ける（任意）

PF ルートで:

```bash
./clean-my_aituber-artifacts.sh
```

`chat_history.db` と `temp.wav` を削除します。トークンも消す場合は `./clean-my_aituber-artifacts.sh --with-token`（次回 VTS 再認証が必要）。

## 同梱ファイル

| ファイル | 説明 |
|---------|------|
| `main.py` | 本体（対話・記憶・音声・VTS 表情ホットキー） |
| `requirements.txt` | pip 用依存関係 |
| `vts_token.txt` | VTube Studio 認証トークン（初回は無くてよい。認証後に自動作成。**他人に配らない**） |

実行時に自動生成されるもの: `chat_history.db`（SQLite）、`temp.wav`（再生用一時ファイル）。

## 前提ソフト（すべてローカルで起動）

1. **LM Studio（または OpenAI 互換 API）**  
   - `main.py` の `LM_URL` 既定は `http://localhost:1235/v1/chat/completions`  
   - 別ポートの場合は `main.py` の `LM_URL` を編集する。

2. **VOICEVOX**  
   - 既定は `http://localhost:50021`（`VV_URL`）。エンジンを起動した状態にする。

3. **VTube Studio**  
   - アプリを起動し、`pyvts` のプラグイン認証ポップアップが出たら許可する。

## Python 環境

```bash
cd my_aituber
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 使い方

1. LM Studio のローカルサーバー、VOICEVOX、VTube Studio を起動する。
2. ターミナルで:

```bash
python main.py
```

3. プロンプトが表示されたら文字を入力して Enter。`exit` または `さよなら` で終了。
4. **独り言モード**: 入力がない状態で約 5 秒経つと、自動プロンプトでひよりが話し始めます（`main.py` 内の仕様）。

## macOS 以外について

- 音声再生に `afplay`（macOS 標準）を使用しています。Windows などでは `main.py` の `subprocess.run(["afplay", "temp.wav"])` を、環境に合ったプレーヤーに差し替えてください。

## VTube Studio 側の設定（表情）

`main.py` 先頭の **`EXPRESSION_HOTKEY_MAP`** と **`VTS_BOOT_MOTION_ITEM_ID`** を、自分の VTS のホットキー名・モーション ID に合わせてください。

## 配布するとき

- `.venv` は含めず、`requirements.txt` から再構築してもらうのが一般的です。
- `vts_token.txt` に個人の認証情報が入るため、**第三者に配る ZIP には含めない**ことを推奨します。受け取り側で初回起動時に VTS が認証を求めます。
