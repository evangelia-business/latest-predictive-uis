// Server-Sent Events: Streaming AI responses
// app/api/socket/route.js

import { Ollama } from 'ollama';

function createSSEHeaders() {
  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  return headers;
}

function sendSSEMessage(controller, data) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}

async function streamFromOllama(question, controller) {
  const ollama = new Ollama();

  const ollamaStream = await ollama.chat({
    model: 'llama3.2',
    messages: [
      { role: 'system', content: OLLAMA_SYSTEM_PROMPT },
      { role: 'user', content: question }
    ],
    stream: true
  });

  let fullResponse = '';
  let currentSection = 'thinking';

  for await (const chunk of ollamaStream) {
    fullResponse += chunk.message?.content || '';

    // Real-time parsing: detect THINKING → ANSWER transition
    if (fullResponse.includes('ANSWER:') && currentSection === 'thinking') {
      currentSection = 'answer';
      const thinkingSteps = extractThinkingSteps(fullResponse);
      sendSSEMessage(controller, {
        type: 'thinking',
        thoughts: thinkingSteps
      });
    }

    // Stream answer progressively
    if (currentSection === 'answer') {
      const answer = extractAnswer(fullResponse);
      sendSSEMessage(controller, { type: 'streaming', delta: answer });
    }
  }

  sendSSEMessage(controller, {
    type: 'complete',
    answer: extractAnswer(fullResponse)
  });
}
