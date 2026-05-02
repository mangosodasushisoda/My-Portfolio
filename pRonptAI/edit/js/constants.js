// --- 1. 画面のレイアウト（見た目）を操作する要素 ---
export const leftWindow = document.querySelector('.left-window');
export const rightWindow = document.querySelector('.right-window');
export const container  = document.querySelector('.container');

// --- 2. 学習者が「書く」ための要素 ---
export const codeEditor = document.getElementById('codeEditor'); // コードを書く場所
export const myInput    = document.getElementById('myInput');    // 質問を書く場所

// --- 3. 学習者が「命令する」ための要素 ---
export const runButton  = document.getElementById('runButton');  // 実行ボタン
export const stopButton = document.getElementById('stopButton'); // 停止ボタン（将来の拡張用）
export const compileButton = document.getElementById('compileButton'); // コンパイルボタン

// --- 4. AIや結果が「答える」ための要素 ---
export const responseDiv = document.getElementById('responseDiv');  // 返答やログが出る場所
export const responseAIDiv = document.getElementById('responseAIDiv');  // AIの返答が出る場所
export const myCanvas = document.getElementById('myCanvas');  // キャンバス

export const terminalResult = {
    logs: ''
}

export const nowCode = {
    code: ''
}

export const excutionState = {
    isRunning: false,
    keys : {}
}

window.excutionState = excutionState; // グローバルに公開して、AIがアクセスできるようにする