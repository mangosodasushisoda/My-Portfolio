import { codeEditor, responseDiv } from './constants.js';

const url = 'http://localhost:1234/v1/chat/completions';

export async function communicationWithAI(message,systemMessage,assistantMessage, onChunk) {
    try {
        const chatMessages = [
            { role: 'system', content: systemMessage }
        ];

        assistantMessage.forEach(item => {
            chatMessages.push({ role: 'user', content: item.question });
            chatMessages.push({ role: 'assistant', content: item.aiResponse });
        });

        chatMessages.push({ role: 'user', content: message });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatMessages,
                stream: true
            })
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (!line.trim() || line.includes('[DONE]')) continue;

                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.replace('data: ', '');
                        const json = JSON.parse(jsonStr);
                        
                        const content = json.choices[0].delta.content;

                        if (content) {
                            fullText += content;
                            if(onChunk) onChunk(fullText);
                        }
                    } catch (e) {
                        console.error('JSONの解析エラー:', e);
                    }
                }
            }
        }
        return fullText;
    }
    catch (error) {
        console.error('通信エラー:', error);
        throw error;
    }
}