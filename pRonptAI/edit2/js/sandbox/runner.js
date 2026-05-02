const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const state = {
  running: false,
  keys: {},
};

window.addEventListener("keydown", (e) => {
  state.keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  state.keys[e.key] = false;
});

function post(type, text) {
  window.parent.postMessage({ type, text }, "*");
}

function stop() {
  state.running = false;
}

/**
 * Scratch っぽい日本語キーワードを JS に変換（実行直前に1回だけかける）
 * - ユーザーコードは (async (api) => { ... }) 内なので api は常に参照できる
 */
function applyScratchJpAliases(source) {
  let code = source;
  // ずっと { … } = 停止ボタンで止まる「メインループ」（Scratch の「ずっと」に近い）
  code = code.replace(/ずっと\s*\{/g, "while (api.state.isRunning()) {");
  code = code.replace(/永遠に\s*\{/g, "while (api.state.isRunning()) {");
  code = code.replace(/もし\s*\(/g, "if (");
  code = code.replace(/でなければ/g, "else");
  code = code.replace(/抜ける\s*;/g, "break;");
  code = code.replace(/続ける\s*;/g, "continue;");
  return code;
}

window.addEventListener("message", async (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "STOP") {
    stop();
    post("LOG", "stopped");
    return;
  }

  if (msg.type !== "RUN_CODE") return;

  state.running = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const oldLog = console.log;
  console.log = (...args) => {
    post("LOG", args.map(String).join(" "));
    oldLog(...args);
  };

  const api = {
    canvas,
    ctx,
    state: {
      keys: state.keys,
      isRunning: () => state.running,
    },
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };

  try {
    const userCode = applyScratchJpAliases(msg.code);
    // new Function("api", ...) で、IIFE 外側の api が引数として解決される
    const wrapped = `
      "use strict";
      return (async (api) => {
${userCode}
      })(api);
    `;
    const fn = new Function("api", wrapped);
    await fn(api);
  } catch (err) {
    post("ERROR", String(err?.stack || err));
  } finally {
    state.running = false;
    console.log = oldLog;
  }
});

window.parent.postMessage({ type: "RUNNER_READY" }, "*");
