export const dom = {
  codeEditor: document.getElementById("codeEditor"),
  outputLog: document.getElementById("outputLog"),
  chatLog: document.getElementById("chatLog"),
  chatInput: document.getElementById("chatInput"),
  runnerFrame: document.getElementById("runnerFrame"),
  templateButton: document.getElementById("templateButton"),
  runButton: document.getElementById("runButton"),
  stopButton: document.getElementById("stopButton"),
  askButton: document.getElementById("askButton"),
};

export const appState = {
  endpoint: "http://localhost:1234/v1/chat/completions",
  memory: [],
};
