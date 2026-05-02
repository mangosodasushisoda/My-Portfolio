import { dom } from "./constants.js";
import { appendOutput, clearOutput } from "./uiChat.js";

let frameReady = false;

function syncReadyFromEarlyBridge() {
  if (typeof window !== "undefined" && window.__pRonptRunnerBridge?.ready) {
    frameReady = true;
  }
}

window.addEventListener("pRonpt-runner-ready", () => {
  frameReady = true;
  appendOutput("runner ready");
});

window.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "RUNNER_READY") {
    frameReady = true;
    appendOutput("runner ready");
    return;
  }

  if (msg.type === "LOG") {
    appendOutput(String(msg.text ?? ""));
    return;
  }

  if (msg.type === "ERROR") {
    appendOutput(String(msg.text ?? ""), "error");
  }
});

syncReadyFromEarlyBridge();

function postToRunner(payload) {
  syncReadyFromEarlyBridge();
  if (!frameReady) {
    appendOutput("runner未準備です。少し待って再実行してください。", "error");
    return;
  }
  dom.runnerFrame.contentWindow.postMessage(payload, "*");
}

export function runCurrentCode() {
  clearOutput();
  postToRunner({ type: "RUN_CODE", code: dom.codeEditor.value });
}

export function stopCurrentCode() {
  postToRunner({ type: "STOP" });
}
