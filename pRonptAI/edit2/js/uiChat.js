import { dom } from "./constants.js";

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function appendUserMessage(text) {
  const safe = escapeHtml(text);
  dom.chatLog.innerHTML += `<div><b>You:</b> ${safe}</div><hr>`;
  dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
}

export function appendAiMessage(markdownText) {
  // sanitize:true は旧仕様だが、最低限のガードとして入力自体はescapeしたうえで使う
  const safeMarkdown = escapeHtml(markdownText);
  const html = marked.parse(safeMarkdown);
  dom.chatLog.innerHTML += `<div><b>AI:</b> ${html}</div><hr>`;
  dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
}

export function appendOutput(text, type = "ok") {
  const css = type === "error" ? "log-err" : "log-ok";
  dom.outputLog.innerHTML += `<span class="${css}">${escapeHtml(text)}</span>\n`;
  dom.outputLog.scrollTop = dom.outputLog.scrollHeight;
}

export function clearOutput() {
  dom.outputLog.textContent = "";
}
