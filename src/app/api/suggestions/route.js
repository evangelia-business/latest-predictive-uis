// API endpoint for generating AI-powered contextual suggestions
import { Ollama } from 'ollama';

const ollama = new Ollama();

/**
 * Generates contextual follow-up questions using Ollama AI
 */
async function generateOllamaSuggestions(context) {
  const { previousQuestion, previousAnswer, conversationHistory } = context;

  try {
    // Build conversation history context
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = '\nConversation History:\n';
      conversationHistory.forEach((entry, index) => {
        historyContext += `${index + 1}. Q: ${entry.question}\n   A: ${entry.answer.substring(0, 150)}...\n`;
      });
    }

    const prompt = `You are an AI assistant helping generate contextual follow-up questions.
Based on the full conversation context below, generate 4 relevant follow-up questions that naturally continue the conversation journey.

${historyContext}
${previousQuestion ? `\nMost Recent Question: ${previousQuestion}` : 'This is the start of the conversation.'}
${previousAnswer ? `Most Recent Answer: ${previousAnswer.substring(0, 200)}...` : ''}

Analyze the conversation flow and topics discussed. Generate 4 diverse, interesting follow-up questions that:
1. Build upon the conversation themes
2. Progress naturally from beginner to more advanced topics if applicable
3. Explore related areas the user might be curious about

Return ONLY a JSON array with this exact format:
[
  {"question": "...", "confidence": 0.95},
  {"question": "...", "confidence": 0.92},
  {"question": "...", "confidence": 0.90},
  {"question": "...", "confidence": 0.88}
]

Important: Return ONLY the JSON array, no other text.`;

    const response = await ollama.generate({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    });

    // Parse the response and add icons
    const questions = JSON.parse(response.response);
    const icons = ['💡', '🔍', '🎯', '📚'];

    return questions.map((q, i) => ({
      question: q.question,
      icon: icons[i],
      confidence: q.confidence
    }));
  } catch (error) {
    console.error('Ollama generation failed:', error);
    // Fallback to pattern matching
    return null;
  }
}

/**
 * Analyzes conversation history to identify themes and patterns
 */
function analyzeConversationThemes(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { themes: [], progression: 'beginner' };
  }

  const allText = conversationHistory.map(entry =>
    `${entry.question} ${entry.answer}`.toLowerCase()
  ).join(' ');

  const themes = [];

  // Detect main themes
  if (allText.includes('programming') || allText.includes('coding') || allText.includes('language')) themes.push('programming');
  if (allText.includes('web') || allText.includes('frontend') || allText.includes('backend')) themes.push('web-dev');
  if (allText.includes('ai') || allText.includes('machine learning') || allText.includes('neural')) themes.push('ai-ml');
  if (allText.includes('career') || allText.includes('job') || allText.includes('work')) themes.push('career');
  if (allText.includes('framework') || allText.includes('library') || allText.includes('tool')) themes.push('tools');
  if (allText.includes('deploy') || allText.includes('production') || allText.includes('hosting')) themes.push('deployment');
  if (allText.includes('learn') || allText.includes('study') || allText.includes('beginner')) themes.push('learning');

  // Detect progression level
  let progression = 'beginner';
  if (conversationHistory.length >= 3) {
    progression = 'intermediate';
  }
  if (allText.includes('advanced') || allText.includes('architecture') || allText.includes('optimization')) {
    progression = 'advanced';
  }

  return { themes, progression };
}

/**
 * Generates contextual follow-up questions using pattern matching (fallback)
 */
function generateAISuggestions(context) {
  const { previousQuestion, previousAnswer, conversationHistory } = context;

  // Analyze conversation history for themes
  const { themes, progression } = analyzeConversationThemes(conversationHistory);

  // For demo purposes, we'll use intelligent pattern matching
  // In production, you'd call OpenAI/Anthropic API here

  if (!previousQuestion) {
    // Initial suggestions - diverse topics
    return [
      { question: "What's the best programming language for beginners?", icon: "💻", confidence: 0.95 },
      { question: "How does machine learning work?", icon: "🤖", confidence: 0.92 },
      { question: "How do I switch careers into tech?", icon: "🔄", confidence: 0.90 },
      { question: "What are the most important tech trends?", icon: "📈", confidence: 0.88 }
    ];
  }

  const lowerQuestion = previousQuestion.toLowerCase();
  const lowerAnswer = previousAnswer?.toLowerCase() || '';

  // Check for conversation journey patterns (multi-theme suggestions)
  if (themes.includes('programming') && themes.includes('web-dev') && lowerQuestion.includes('deploy')) {
    // User journey: programming -> web dev -> deployment
    return [
      { question: "What's the best hosting platform for beginners?", icon: "☁️", confidence: 0.96 },
      { question: "Should I learn Docker and containerization?", icon: "🐳", confidence: 0.93 },
      { question: "How do I set up CI/CD pipelines?", icon: "🔄", confidence: 0.90 },
      { question: "What are the best practices for production deployments?", icon: "✅", confidence: 0.87 }
    ];
  }

  if (themes.includes('programming') && themes.includes('web-dev') && progression === 'intermediate') {
    // User journey: learning web dev, progressing to intermediate
    return [
      { question: "Should I focus on frontend or backend specialization?", icon: "🎯", confidence: 0.94 },
      { question: "How do I build a full-stack application?", icon: "🏗️", confidence: 0.91 },
      { question: "What database should I use for my web app?", icon: "🗄️", confidence: 0.89 },
      { question: "How important is learning TypeScript?", icon: "📘", confidence: 0.86 }
    ];
  }

  if (themes.includes('learning') && themes.includes('career') && progression === 'beginner') {
    // User journey: learning fundamentals, thinking about career
    return [
      { question: "How long until I'm job-ready?", icon: "⏱️", confidence: 0.95 },
      { question: "Should I build projects or take more courses?", icon: "🔨", confidence: 0.92 },
      { question: "What makes a strong developer portfolio?", icon: "💼", confidence: 0.90 },
      { question: "Do I need a computer science degree?", icon: "🎓", confidence: 0.87 }
    ];
  }

  // Programming-related suggestions
  if (lowerQuestion.includes('programming') || lowerQuestion.includes('coding') ||
      lowerQuestion.includes('language') || lowerAnswer.includes('python') ||
      lowerAnswer.includes('javascript') || lowerAnswer.includes('java')) {
    return [
      { question: "What frameworks should I learn for web development?", icon: "🌐", confidence: 0.93 },
      { question: "How long does it take to become job-ready?", icon: "⏱️", confidence: 0.91 },
      { question: "Should I focus on frontend or backend first?", icon: "🎯", confidence: 0.89 },
      { question: "What are the best resources for learning to code?", icon: "📚", confidence: 0.87 }
    ];
  }

  // AI/ML-related suggestions
  if (lowerQuestion.includes('ai') || lowerQuestion.includes('machine learning') ||
      lowerQuestion.includes('artificial intelligence') || lowerAnswer.includes('neural') ||
      lowerAnswer.includes('model') || lowerAnswer.includes('algorithm')) {
    return [
      { question: "What math do I need to know for machine learning?", icon: "📐", confidence: 0.94 },
      { question: "How can I build my first AI project?", icon: "🛠️", confidence: 0.92 },
      { question: "What's the difference between supervised and unsupervised learning?", icon: "🎓", confidence: 0.90 },
      { question: "Which AI tools are best for beginners?", icon: "🔧", confidence: 0.88 }
    ];
  }

  // Career-related suggestions
  if (lowerQuestion.includes('career') || lowerQuestion.includes('job') ||
      lowerQuestion.includes('work') || lowerQuestion.includes('switch') ||
      lowerAnswer.includes('career') || lowerAnswer.includes('job market')) {
    return [
      { question: "How do I build a strong tech portfolio?", icon: "💼", confidence: 0.95 },
      { question: "What salary should I expect as a junior developer?", icon: "💰", confidence: 0.91 },
      { question: "Is a computer science degree necessary?", icon: "🎓", confidence: 0.89 },
      { question: "How important are certifications in tech?", icon: "📜", confidence: 0.86 }
    ];
  }

  // Learning/education-related suggestions
  if (lowerQuestion.includes('learn') || lowerQuestion.includes('study') ||
      lowerQuestion.includes('course') || lowerAnswer.includes('learning') ||
      lowerAnswer.includes('practice')) {
    return [
      { question: "What's the best way to stay motivated while learning?", icon: "💪", confidence: 0.93 },
      { question: "How many hours a day should I practice coding?", icon: "⏰", confidence: 0.90 },
      { question: "Should I learn by building projects or taking courses?", icon: "🔨", confidence: 0.88 },
      { question: "How do I overcome tutorial hell?", icon: "🎯", confidence: 0.87 }
    ];
  }

  // Trend/future-related suggestions
  if (lowerQuestion.includes('trend') || lowerQuestion.includes('future') ||
      lowerQuestion.includes('2025') || lowerQuestion.includes('emerging')) {
    return [
      { question: "Will AI replace software developers?", icon: "🤖", confidence: 0.94 },
      { question: "What's the future of remote work in tech?", icon: "🏠", confidence: 0.91 },
      { question: "Which programming languages will be most valuable?", icon: "📊", confidence: 0.89 },
      { question: "How is quantum computing affecting the industry?", icon: "⚛️", confidence: 0.85 }
    ];
  }

  // Tools/frameworks suggestions
  if (lowerQuestion.includes('framework') || lowerQuestion.includes('tool') ||
      lowerQuestion.includes('library') || lowerAnswer.includes('react') ||
      lowerAnswer.includes('framework')) {
    return [
      { question: "Should I learn React, Vue, or Angular?", icon: "⚛️", confidence: 0.92 },
      { question: "What's the difference between frameworks and libraries?", icon: "📦", confidence: 0.90 },
      { question: "How do I choose the right tech stack?", icon: "🏗️", confidence: 0.88 },
      { question: "Are full-stack frameworks worth learning?", icon: "🎯", confidence: 0.86 }
    ];
  }

  // Default contextual suggestions based on question complexity
  const isComplexQuestion = previousQuestion.split(' ').length > 8;

  if (isComplexQuestion) {
    return [
      { question: "Can you explain that in simpler terms?", icon: "💡", confidence: 0.90 },
      { question: "What are some practical examples of this?", icon: "🔍", confidence: 0.88 },
      { question: "What resources can I use to learn more?", icon: "📚", confidence: 0.85 },
      { question: "How long would it take to master this?", icon: "⏳", confidence: 0.83 }
    ];
  }

  // Fallback: general follow-up suggestions
  return [
    { question: "What skills should I prioritize learning?", icon: "🎯", confidence: 0.88 },
    { question: "How do I stay updated with tech changes?", icon: "📰", confidence: 0.86 },
    { question: "What are common mistakes beginners make?", icon: "⚠️", confidence: 0.84 },
    { question: "How can I practice my skills effectively?", icon: "🏋️", confidence: 0.82 }
  ];
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { previousQuestion, previousAnswer, conversationHistory } = body;

    // Try to generate suggestions using Ollama first
    let suggestions = await generateOllamaSuggestions({
      previousQuestion,
      previousAnswer,
      conversationHistory
    });

    let source = 'ollama';

    // If Ollama fails, fallback to pattern matching
    if (!suggestions) {
      source = 'pattern-matching';
      suggestions = generateAISuggestions({
        previousQuestion,
        previousAnswer,
        conversationHistory
      });
    }

    return Response.json({
      suggestions,
      timestamp: Date.now(),
      source
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return Response.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

// Support GET for initial suggestions (no context)
export async function GET() {
  const suggestions = generateAISuggestions({});

  return Response.json({
    suggestions,
    timestamp: Date.now()
  });
}
