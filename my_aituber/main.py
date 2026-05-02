import sqlite3
import requests
import json
import threading
import queue
import subprocess
from datetime import datetime
import pyvts
import asyncio

# --- 環境ごとに編集（配布・他 PC では自分の LM Studio / VOICEVOX / VTS に合わせて変更）---
LM_URL = "http://localhost:1235/v1/chat/completions"
VV_URL = "http://localhost:50021"
DB_NAME = "chat_history.db"

VTS_PLUGIN_NAME = "HiyoriControl"
VTS_TOKEN_PATH = "./vts_token.txt"
# 接続直後に一度送るモーション（VTS のアイテム／モデルに依存。自分の環境の ID に差し替え）
VTS_BOOT_MOTION_ITEM_ID = "hiyori_m03.motion3.json"

# 応答テキストのキーワード → VTS ホットキー ID（VTS 側のホットキー名と一致させる）
EXPRESSION_HOTKEY_MAP = {
    "HAPPY": "HAPPY",
    "SAD": "SAD",
    "SURPRISE": "SURPRISE",
}

# --- データベース準備 ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS history 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)''')
    conn.commit()
    conn.close()

def save_message(role, content):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO history (role, content) VALUES (?, ?)", (role, content))
    conn.commit()
    conn.close()

def load_history(limit=5):
    if limit <= 0: return []
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT role, content FROM history ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"role": row[0], "content": row[1]} for row in reversed(rows)]

# --- 音声再生 ---
speech_queue = queue.Queue()
def voicevox_worker():
    while True:
        text = speech_queue.get()
        if text is None: break
        try:
            query_res = requests.post(f"{VV_URL}/audio_query?text={text}&speaker=1")
            query_data = query_res.json()
            query_data["speedScale"] = 1.4
            query_data["pitchScale"] = 0.05
            synthesis_res = requests.post(f"{VV_URL}/synthesis?speaker=1", json=query_data)
            with open("temp.wav", "wb") as f:
                f.write(synthesis_res.content)
            subprocess.run(["afplay", "temp.wav"])
        except Exception as e:
            print(f"VOICEVOXエラー: {e}")
        speech_queue.task_done()

threading.Thread(target=voicevox_worker, daemon=True).start()

# --- 表情管理クラス ---
class ExpressionManager:
    def __init__(self):
        self.vts = None
        self.loop = asyncio.new_event_loop()
        threading.Thread(target=self._run_loop, daemon=True).start()

    def _run_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    async def _connect(self):
        print("[DEBUG] VTSへの接続を開始します...")
        try:
            plugin_info = {
                "plugin_name": VTS_PLUGIN_NAME,
                "developer": "User",
                "authentication_token_path": VTS_TOKEN_PATH,
            }
            # 1. インスタンス作成
            self.vts = pyvts.vts(plugin_info=plugin_info)
            
            # 2. ネットワーク接続
            await self.vts.connect()
            print("[DEBUG] ネットワーク接続成功。")
            
            # 3. 認証情報の確認と実行
            # トークンファイルがない場合は、VTSに「許可」を求めるポップアップを出します
            await self.vts.request_authenticate_token() # トークン取得
            await self.vts.write_token()                # ファイルに保存
            await self.vts.request_authenticate()       # 認証実行
            
            print("[SYSTEM] VTube Studio 接続＆認証完了！")
            # 最も確実な「生のリクエスト」を送信する方法です
            await self.vts.request({
                "apiName": "VTubeStudioPublicAPI",
                "apiVersion": "1.0",
                "requestID": "SomeID",
                "messageType": "HotkeyTriggerRequest", # モーションはホットキー扱い
                "data": {
                    "itemInstanceID": VTS_BOOT_MOTION_ITEM_ID,
                }
            })
            
        except Exception as e:
            print(f"[ERROR] VTS接続中に問題が発生しました: {e}")
            import traceback
            traceback.print_exc() # どこでエラーが出たか詳細を表示

    def connect(self):
        asyncio.run_coroutine_threadsafe(self._connect(), self.loop)

    async def change_expression_task(self, text):
        if not self.vts: return
        
        text_upper = text.upper()
        print(f"\n[DEBUG] 判定開始: {text_upper}") 

        for word, hotkey_name in EXPRESSION_HOTKEY_MAP.items():
            if word in text_upper:
                msg = {
                    "apiName": "VTubeStudioPublicAPI",
                    "apiVersion": "1.0",
                    "requestID": "HotkeyTrigger",
                    "messageType": "HotkeyTriggerRequest",
                    "data": {
                        "hotkeyID": hotkey_name # ここに HAPPY や SAD が入る
                    }
                }
                await self.vts.request(msg)
                print(f"[SYSTEM] ホットキー「{hotkey_name}」を実行しました")
                return

exp_manager = ExpressionManager()
exp_manager.connect()

# --- AI処理 ---
def ask_ai_with_memory(user_input):
    now = datetime.now().strftime("%Y年%m月%d日 %H:%M")
    past_messages = load_history(limit=5) 
    save_message("user", user_input)
    
    system_content = (
        f"現在は{now}です。あなたはVTuberの「ひより」としてライブ配信をしています。\n"
        "リスナーがコメントを打つので、親しみやすく、配信者らしい元気な口調で答えてください。\n"
        "【重要】返答の冒頭に必ず [HAPPY], [SAD], [SURPRISE], [NEUTRAL] のどれかを付けてください。返答は2行以内で行ってください。"
    )
    
    messages = [{"role": "system", "content": system_content}]
    messages.extend(past_messages)
    messages.append({"role": "user", "content": user_input})
    messages.append({"role": "assistant", "content": "["}) # AIにタグから書かせる
    
    payload = {"messages": messages, "temperature": 0.7, "stream": True}
    response = requests.post(LM_URL, json=payload, stream=True)
    
    full_response = ""
    sentence = ""
    print("ひより: [", end="") # messages.appendに合わせて[を表示
    
    first_chunk = True

    for line in response.iter_lines():
        if line:
            chunk = line.decode('utf-8').strip()
            if chunk.startswith("data: ") and chunk != "data: [DONE]":
                data = json.loads(chunk[6:])
                content = data['choices'][0]['delta'].get('content', '')
                print(content, end="", flush=True)
                full_response += content
                sentence += content

                # --- 修正ポイント：文の区切りを待たずに即座に判定へ送る ---
                # --- 修正ポイント：文字が少し溜まってから判定に送る ---
                # 3文字だと [HAPP で切れる可能性があるので、8文字（タグが完成する長さ）に変更
                if first_chunk and len(sentence) > 8:
                    asyncio.run_coroutine_threadsafe(
                        exp_manager.change_expression_task(sentence), 
                        exp_manager.loop
                    )
                    first_chunk = False

                if content in ["。", "！", "？", "\n"]:
                    if sentence.strip():
                        # 音声のゴミ掃除
                        clean_text = sentence
                        for t in ["[HAPPY]", "HAPPY]", "[SAD]", "SAD]", "[SURPRISE]", "SURPRISE]", "[NEUTRAL]", "NEUTRAL]", "["]:
                            clean_text = clean_text.replace(t, "")
                        
                        if clean_text.strip():
                            speech_queue.put(clean_text.strip())
                        sentence = ""
    
    print()
    save_message("assistant", full_response)
    print("\n[SYSTEM] 音声再生が終わるのを待っています...")
    speech_queue.join() # 声が出終わるまでここで一時停止

import random
import time
import select
import sys

# --- メインループを「無限モード」に改造 ---
if __name__ == "__main__":
    init_db()
    print("\n" + "="*40)
    print("      🌟 ひより 無限独り言モード 起動！ 🌟      ")
    print("="*40)
    print(" ※何か入力すれば返事をしてくれます。")

    while True:
        print(f"\n[待機中...] 何か話しかけるか、5秒待つとひよりが喋ります。")
        
        # 入力を5秒間だけ待つ（Mac/Linux用）
        # Windowsの場合は msvcrt を使う必要がありますが、まずはこれで試しましょう
        rlist, _, _ = select.select([sys.stdin], [], [], 5.0)

        if rlist:
            # あなたが何か打った場合
            u_input = sys.stdin.readline().strip()
            if u_input.lower() in ["exit", "さよなら"]: break
            ask_ai_with_memory(u_input)
        else:
            # 5秒間、誰も何も言わなかった場合
            auto_prompts = [
                "今の気分を独り言でつぶやいて",
                "最近あった面白いことを勝手に話して",
                "視聴者に向けた挨拶を元気にして",
                "お腹が空いたことについてボヤいて",
                "急に哲学的なことを語り出して"
            ]
            auto_input = random.choice(auto_prompts)
            print(f"\n[SYSTEM] ひよりが勝手に考え中...")
            ask_ai_with_memory(f"（独り言モード）{auto_input}")