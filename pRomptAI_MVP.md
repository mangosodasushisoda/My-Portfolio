**※これはAIが書いたので真実ではないものが含まれている可能性があります。やったことはあってます。感想などは全てAIの捏造です。**

**AIと一緒に開発しました**
# 🚀 pRomptAI MVP
> **「自然言語を、即座に動的な実行環境へ。」** ローカルLLMと実行エンジンを高度に融合させた次世代AIインターフェース。

---

## 📊 開発マイルストーン
* **開発期間:** 約6日間（集中開発フェーズ）
* **コンセプト:** ボイラープレートレスなAIコード実行エコシステム
* **主要技術:** Local LLM (LM Studio), JavaScript (Async Runtime), Canvas API

---

## 🛠 実装済み主要機能

### 1. AI Interaction & Compilation
AIとの対話をそのまま実行リソースへと変換するコア・コンポーネント。
* **LM Studio Integration:** ローカル環境で完結するLLM対話インターフェースを構築。
* **Auto-Compiler:** 自然言語による曖昧な命令を、即座に実行可能な純粋なJavaScriptへとコンパイルします。

### 2. Robust Execution Engine
「生成されたコードを安全かつ確実に動かす」ための専用エンジン。
* **Runtime Control:** `new Function` と非同期処理を組み合わせ、実行・停止を自在に制御するシステムを実装。
* **Implicit Context:** `executionState` 等のオブジェクトを暗黙の前提とすることで、AIが余計な記述を省き、本質的なロジックのみを生成できる環境を提供。

### 3. Interactive Ecosystem
AIが「見て、触れて、動かせる」ための動的環境。
* **Canvas System:** 生成されたコードから直接グラフィックスを制御できる描画環境を統合。
* **Input Detection:** ユーザーのキーボード入力をリアルタイムでAI生成コードへ同期。インタラクティブな体験を即座に構築可能です。

### 4. Advanced Prompt Engineering
AIのポテンシャルを最大限に引き出すための最適化。
* **Behavioral Constraint:** 冗長な解説やノイズを徹底的に排除。出力の「コード純度」を高めることで、実行成功率を極限まで引き上げるプロンプト定義を確立しました。

---

## 💡 技術的なこだわり
> AIに「何を書かせるか」だけでなく、AIが「最も書きやすい環境をどう作るか」に注力しました。
> 特に実行コンテキストの設計により、生成AI特有のハルシネーションや構文エラーを最小限に抑え込むことに成功しています。

---
*Developed with Passion and AI Collaboration.*