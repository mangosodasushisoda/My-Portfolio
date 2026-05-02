import { dom, appState } from "./constants.js";
import { askCoach } from "./aiClient.js";
import { buildCoachSystemPrompt, buildCoachUserPrompt } from "./coachPrompts.js";
import { appendUserMessage, appendAiMessage, appendOutput } from "./uiChat.js";
import { runCurrentCode, stopCurrentCode } from "./uiEditor.js";

async function loadTemplate() {
  const res = await fetch("./js/templates/breakout.js");
  dom.codeEditor.value = await res.text();
  appendOutput("ブロック崩しテンプレを読み込みました。");
}

async function askAI() {
  const userMessage = dom.chatInput.value.trim();
  if (!userMessage) return;
  dom.chatInput.value = "";
  appendUserMessage(userMessage);

  const userPrompt = buildCoachUserPrompt({
    userMessage,
    code: dom.codeEditor.value,
    logs: dom.outputLog.textContent,
  });

  try {
    dom.askButton.disabled = true;
    const answer = await askCoach({
      systemPrompt: buildCoachSystemPrompt(),
      userPrompt,
      memory: appState.memory,
    });
    appendAiMessage(answer);
    appState.memory.push({ user: userPrompt, assistant: answer });
    if (appState.memory.length > 6) appState.memory.shift();
  } catch (err) {
    appendOutput(err.message || String(err), "error");
  } finally {
    dom.askButton.disabled = false;
  }
}

dom.templateButton.addEventListener("click", loadTemplate);
dom.runButton.addEventListener("click", runCurrentCode);
dom.stopButton.addEventListener("click", stopCurrentCode);
dom.askButton.addEventListener("click", askAI);

dom.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAI();
  }
});

loadTemplate();
