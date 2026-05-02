import { appState } from "./constants.js";

export async function askCoach({ systemPrompt, userPrompt, memory }) {
  const messages = [{ role: "system", content: systemPrompt }];

  for (const item of memory) {
    messages.push({ role: "user", content: item.user });
    messages.push({ role: "assistant", content: item.assistant });
  }

  messages.push({ role: "user", content: userPrompt });

  const response = await fetch(appState.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI通信失敗: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AIから有効な返答を取得できませんでした。");
  return content;
}
