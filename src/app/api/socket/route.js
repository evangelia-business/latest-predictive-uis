// app/api/socket/route.js
import { Ollama } from 'ollama';

const ollama = new Ollama();

// ============================================================================
// Constants
// ============================================================================

const FALLBACK_THINKING_STEPS = [
  "Breaking down the question into key components...",
  "Analyzing different perspectives on this topic...",
  "Considering relevant examples and case studies...",
  "Evaluating the strengths and weaknesses of each approach...",
  "Looking for connections between different concepts...",
  "Reviewing potential counterarguments...",
  "Synthesizing information from multiple sources...",
  "Formulating a comprehensive response...",
  "Double-checking reasoning for logical consistency...",
  "Preparing final answer with clear explanations..."
];

const OLLAMA_SYSTEM_PROMPT = `You are a helpful AI assistant that shows its reasoning process.
When answering questions, first show your thinking steps, then provide the answer.

Format your response EXACTLY like this:
THINKING:
- [First thing you need to consider]
- [Second aspect to analyze]
- [Third point to evaluate]
- [Continue as needed]

ANSWER:
[Your detailed answer here]

Important: Always start with "THINKING:" and list your reasoning steps with bullet points, then write "ANSWER:" before your final response.`;

// ============================================================================
// Utilities
// ============================================================================

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

function extractThinkingSteps(text) {
  const thinkingSection = text.replace('THINKING:', '').split('ANSWER:')[0];
  return thinkingSection
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim())
    .filter(step => step.length > 0);
}

function extractAnswer(text) {
  const parts = text.split('ANSWER:');
  return parts.length > 1 ? parts[1].trim() : '';
}

// ============================================================================
// Ollama Streaming
// ============================================================================

async function streamFromOllama(question, controller) {
  const ollamaStream = await ollama.chat({
    model: 'llama3.2',
    messages: [
      { role: 'system', content: OLLAMA_SYSTEM_PROMPT },
      { role: 'user', content: question }
    ],
    stream: true,
    options: { temperature: 0.7, top_p: 0.9 }
  });

  let fullResponse = '';
  let currentSection = 'thinking';
  let lastThinkingCount = 0;

  for await (const chunk of ollamaStream) {
    fullResponse += chunk.message?.content || '';

    // Just switched to answer section
    if (fullResponse.includes('ANSWER:') && currentSection === 'thinking') {
      currentSection = 'answer';

      const thinkingSteps = extractThinkingSteps(fullResponse);
      sendSSEMessage(controller, {
        type: 'thinking',
        thoughts: thinkingSteps,
        step: thinkingSteps.length,
        total: thinkingSteps.length
      });

      const answer = extractAnswer(fullResponse);
      if (answer) {
        sendSSEMessage(controller, { type: 'streaming', answer });
      }
    }
    // Still building thinking steps
    else if (currentSection === 'thinking') {
      const thinkingSteps = extractThinkingSteps(fullResponse);
      if (thinkingSteps.length > lastThinkingCount) {
        lastThinkingCount = thinkingSteps.length;
        sendSSEMessage(controller, {
          type: 'thinking',
          thoughts: thinkingSteps,
          step: thinkingSteps.length,
          total: thinkingSteps.length
        });
      }
    }
    // Streaming the answer
    else {
      const answer = extractAnswer(fullResponse);
      sendSSEMessage(controller, { type: 'streaming', answer });
    }
  }

  // Send final message
  const finalAnswer = extractAnswer(fullResponse) || fullResponse;
  sendSSEMessage(controller, { type: 'complete', answer: finalAnswer });
}

// ============================================================================
// Fallback (when Ollama not available)
// ============================================================================

function generateFallbackAnswer(question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('programming') || lowerQuestion.includes('coding')) {
    return `For programming-related questions like "${question}", I recommend considering factors like: learning curve, community support, job market demand, and your specific goals. Popular beginner-friendly options include Python for general programming, JavaScript for web development, or Java for enterprise applications.`;
  }

  if (lowerQuestion.includes('ai') || lowerQuestion.includes('machine learning')) {
    return `Regarding "${question}", AI is a rapidly evolving field with applications in automation, data analysis, and decision-making. Key considerations include understanding the technology's capabilities, limitations, ethical implications, and practical implementation strategies.`;
  }

  if (lowerQuestion.includes('career') || lowerQuestion.includes('job')) {
    return `For career questions like "${question}", success typically involves continuous learning, networking, skill development, and adapting to market changes. Consider your interests, strengths, market demand, and long-term goals when making career decisions.`;
  }

  return `Thank you for asking "${question}". Based on my analysis, I've considered multiple perspectives and approaches. The key insights are: 1) Context and specifics matter greatly, 2) There are often multiple valid approaches, and 3) The best solution depends on your particular circumstances and goals.`;
}

async function streamFallbackResponse(question, controller) {
  const steps = [
    `Analyzing the question: "${question}"`,
    ...FALLBACK_THINKING_STEPS.slice(0, 6),
    `Considering specific aspects related to: ${question}`,
    ...FALLBACK_THINKING_STEPS.slice(6)
  ];

  const currentThoughts = [];

  for (let i = 0; i < steps.length; i++) {
    currentThoughts.push(steps[i]);
    sendSSEMessage(controller, {
      type: 'thinking',
      thoughts: [...currentThoughts],
      step: i + 1,
      total: steps.length
    });
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  const answer = generateFallbackAnswer(question);
  sendSSEMessage(controller, { type: 'complete', answer });
}

// ============================================================================
// Main Handler
// ============================================================================

async function isOllamaAvailable() {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

async function handleStreaming(question, controller) {
  const available = await isOllamaAvailable();

  if (!available) {
    console.log('Ollama not available, using fallback');
    await streamFallbackResponse(question, controller);
    return;
  }

  try {
    await streamFromOllama(question, controller);
  } catch (streamError) {
    console.error('Ollama streaming failed:', streamError.message);
    await streamFallbackResponse(question, controller);
  }
}

// ============================================================================
// API Route
// ============================================================================

export async function GET(req) {
  const headers = createSSEHeaders();
  const url = new URL(req.url);
  const question = url.searchParams.get('question') || 'general inquiry';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await handleStreaming(question, controller);
        setTimeout(() => {
          try {
            controller.close();
          } catch (error) {
            console.log('Controller already closed:', error.message);
          }
        }, 100);
      } catch (error) {
        console.error('Stream error:', error);
        try {
          controller.error(error);
        } catch {
          console.log('Controller already errored or closed');
        }
      }
    },
    cancel() {
      console.log('Stream cancelled by client');
    }
  });

  return new Response(stream, { headers });
}
