// 必要な機能を他のファイルから呼び出す（パスは環境に合わせて調整してくださいね）
import './constants.js';
import './ai.js';
import './editors/editorExcution.js'; // 実行ボタンのイベント登録
import './editors/question.js';       // AIチャットのイベント登録

// window.excutionState が存在することを確認してから登録します
window.addEventListener('keydown', (e) => {
    if (window.excutionState) {
        window.excutionState.keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (window.excutionState) {
        window.excutionState.keys[e.key] = false;
    }
});

console.log("🛠️ AIエディタ、起動完了ですわ！");