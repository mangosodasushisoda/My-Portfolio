import { codeEditor, responseDiv, responseAIDiv, myInput, terminalResult } from '../constants.js';
import { communicationWithAI } from '../ai.js';

const memory = [];
let HTMLhistory = '';

async function question(userInput) {
    const question = myInput.value;

    HTMLhistory += `<div><strong>You:</strong> ${marked.parse(userInput)}</div>`;
    HTMLhistory += `<hr>`;
    responseAIDiv.scrollTop = responseAIDiv.scrollHeight;

    const questionLog = `
    【コード】
    ${userInput}

    【ターミナル】
    ${terminalResult.logs}
    
    【私が言ったこと】
    ${question}`;
    try {
        const aiResponse = await communicationWithAI(questionLog, "あなたは優秀な自然言語プログラミングの先生です。質問に対して、わかりやすく、丁寧に、具体的に答えてください。", memory, (text) => {
            responseAIDiv.innerHTML = `${HTMLhistory}<div>AI: ${marked.parse(text)}</div>`;
        });
        HTMLhistory += `<div><strong>AI:</strong> ${marked.parse(aiResponse)}</div>`;
        HTMLhistory += `<hr>`;
        responseAIDiv.scrollTop = responseAIDiv.scrollHeight;
        memory.push({ question, aiResponse });
    }
    catch (error) {
        responseAIDiv.textContent = 'エラー: ' + error.message;
    }
}

myInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const userInput = myInput.value;
        if (!userInput.trim()) return;
        myInput.value = '';
        question(userInput);
    }
});