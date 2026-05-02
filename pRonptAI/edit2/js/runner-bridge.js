/**
 * main.js は type=module のため実行が遅れ、iframe 側の RUNNER_READY が先に飛ぶと
 * 親のリスナーが未登録のまま捨てられる。この同期スクリプトで先に受けておく。
 */
(function () {
  window.__pRonptRunnerBridge = { ready: false };
  window.addEventListener("message", function (e) {
    const d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "RUNNER_READY") {
      window.__pRonptRunnerBridge.ready = true;
      window.dispatchEvent(new CustomEvent("pRonpt-runner-ready"));
    }
  });
})();
