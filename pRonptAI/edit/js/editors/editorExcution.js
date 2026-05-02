import { codeEditor, runButton, stopButton, compileButton, myCanvas, responseDiv, terminalResult, nowCode, excutionState} from '../constants.js';
import { communicationWithAI } from '../ai.js';

const originalLog = console.log; // 元のconsole.logを保存
let logs = '';

async function compile() {
    let code = codeEditor.value;
    runButton.disabled = true;
    stopButton.disabled = true;
    compileButton.disabled = true;

    if (myCanvas) {
        const ctx = myCanvas.getContext('2d');
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    }

    try {
        let prompt = `
        以下の指示を厳守してJavaScriptコードに変換してください：

        1. 【出力形式】
        - 返答はJavaScriptコードのみを出力し、解説文は一切禁止します。
        - 補足が必要な場合は必ずコード内にコメント（// または /* */）として記述してください。

        2. 【利用可能な環境（重要）】
        - console.log(): 結果の出力に使用。
        - Canvas: id="myCanvas" が使用可能。利用時は冒頭で「const canvas = document.getElementById('myCanvas'); const ctx = canvas.getContext('2d');」を定義すること。
        - excutionState: window.excutionStateに実体があるものとして扱い、再定義や初期化（const excutionState = ...）は絶対に行わないでください。
            - excutionState.isRunning (boolean): ループの継続判定。
            - excutionState.keys (object): キー入力状態。例: if (excutionState.keys[' ']) でスペース判定。

        3. 【実行とループの鉄則】
        - キー入力待ちなどの継続的な処理は、必ず「while (excutionState.isRunning)」ループ内で記述してください。
        - ループ内には必ず「await new Promise(r => setTimeout(r, 16));」を記述し、フリーズを防止してください。
        - 生成するコード全体を、必ず以下の「非同期即時実行関数」で囲んで出力してください。
            (async function() {
                // ここにロジックを記述
            })();

        4. 【ロジックの展開】
        - 変換元のロジックを正確に維持すること。
        - 余計な関数定義（main関数を作るだけ等）で終わらせず、必ずその場で実行される形式（即時実行関数の中身）で記述してください。
        excutionState: 必ず excutionState という変数名で直接使用してください。（window. は付けなくて良いです）

        変換元：
        ${code}`;

        let data = await communicationWithAI(prompt, "",[], (text) => {
            responseDiv.innerText = text;
        });
        const match = data.match(/```(?:javascript)?\s*([\s\S]*?)```/);
        if (match) {
            data = match[1].trim();
        } else {
            // コードブロックがなければ、全て捨てるか警告
            data = '';
        }

        if (!data) {
            responseDiv.textContent = 'コンパイル失敗: AIがコードを返しませんでした。';
            return;
        }
        nowCode.code = data; // コンパイルされたコードを保存
        responseDiv.innerText = "--- コンパイルされたコード ---\n" + data;
    }
    catch (error) {
        responseDiv.textContent = 'エラー: ' + error.message;
    }
    finally {
        runButton.disabled = false;
        compileButton.disabled = false;
        stopButton.disabled = true;
    }
}

async function execution() {
    logs = ''; // ログをリセット
    if (myCanvas) {
        const ctx = myCanvas.getContext('2d');
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    }

    try {
        console.log = function(...args) {
            logs += args.join(" ") + "\n";
            originalLog.apply(console, args);
            responseDiv.innerText = "--- 実行結果 ---\n" + logs + "\n--- 実行されたコード ---\n" + nowCode.code;
            terminalResult.logs = logs; // ターミナルの結果を保存
        };

        if (!nowCode.code) {
            responseDiv.textContent = 'コードがありません。まずはコンパイルしてください。';
            return;
        }

        // AIを実行する関数の中
        // editorExcution.js 内の execution関数
        const functionBody = `
            const excutionState = window.excutionState; 
            try {
                // AIのコード自体が (async function(){...})() なので、そのまま評価させるだけでOK
                return ${nowCode.code}; 
            } catch (e) {
                console.error("実行エラー:", e);
            }
        `;

        const executeCode = new Function(functionBody);
        await executeCode(excutionState);

        responseDiv.innerText = "--- 実行結果 ---\n" + logs + "\n--- 実行されたコード ---\n" + nowCode.code;
        terminalResult.logs = logs; // ターミナルの結果を保存

        runButton.blur(); 
    }
    catch (error) {
        responseDiv.textContent = 'エラー: ' + error.message;
    }
    finally {
    console.log = originalLog; // console.logを元に戻す
    }
}

function stopExecution() {
    let id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id);
        window.clearInterval(id);
    }
}

runButton.addEventListener('click', () => {
    runButton.disabled = true;
    stopButton.disabled = false;
    compileButton.disabled = true;
    window.excutionState.isRunning = true;
    execution();
});
stopButton.addEventListener('click', () => {
    stopButton.disabled = true;
    compileButton.disabled = false;
    runButton.disabled = false;
    window.excutionState.isRunning = false;
    stopExecution();
});
compileButton.addEventListener('click', compile);

stopButton.disabled = true; // 初期状態では停止ボタンを無効化
runButton.disabled = false; // 実行ボタンは有効
compileButton.disabled = false; // コンパイルボタンは有効