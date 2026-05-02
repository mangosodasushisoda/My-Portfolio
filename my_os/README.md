# my_os（簡易ターミナル型 OS）

中学生のときに約 **5 日間**で制作。AI が提案したコードをベースに **Rust** で組み立て、キーボード入力と VGA テキスト出力によるオモチャ程度の OS です。`HI` と打って Enter すると `Hello!` と応答します。

## ダウンロード（ZIP）

ポートフォリオを `serve.sh` で表示しているとき **`downloads/my_os-source.zip`** からソース一式を取得できます（`target/` は含みません）。

ZIP を更新したら PF ルートで `./package-my_os.sh` を実行してください。

## 構成（ソースのみ）

```
my_os/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs       … エントリ（キーボード・VGA・「HI」判定）
│   ├── interrupts.rs
│   ├── vga_buffer.rs
│   └── interrputs.rs   （綴りは当時のファイル名のまま）
└── .cargo/config.toml
```

`target/` はビルド成果物なので Git には含めません。

## ビルド・実行（ローカル）

[Rust](https://rustup.rs/) と `bootimage` が必要です。

```bash
cd my_os
rustup override set nightly   # no_std / bootloader 用に nightly が必要な場合があります
rustup component add llvm-tools-preview   # bootimage / llvm-objcopy 用（未導入だと bootimage が失敗することがあります）
cargo install bootimage
cargo bootimage
```

生成された `target/x86_64-my_os/debug/bootimage-my_os.bin` を QEMU などで起動して動作確認できます（環境によりパスは異なります）。

## 注意

- 教材・実験目的のコードです。実機や公開サーバーでの利用は想定していません。
