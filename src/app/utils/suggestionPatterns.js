/**
 * Pattern-based suggestion generation (fallback when Ollama fails)
 */

/**
 * Analyzes recent conversation to identify current themes
 * Only looks at last 2 conversations to avoid stale themes
 */
export function analyzeRecentThemes(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { themes: [], progression: 'beginner', topicSwitch: false };
  }

  // Only analyze last 2 conversations for fresh context
  const recentHistory = conversationHistory.slice(-2);

  const allText = recentHistory
    .map(entry => `${entry.question} ${entry.answer}`.toLowerCase())
    .join(' ');

  const themes = [];

  // Detect main themes
  if (allText.includes('programming') || allText.includes('coding') || allText.includes('language'))
    themes.push('programming');
  if (allText.includes('web') || allText.includes('frontend') || allText.includes('backend'))
    themes.push('web-dev');
  if (allText.includes('ai') || allText.includes('machine learning') || allText.includes('neural'))
    themes.push('ai-ml');
  if (allText.includes('career') || allText.includes('job') || allText.includes('work'))
    themes.push('career');
  if (allText.includes('framework') || allText.includes('library') || allText.includes('tool'))
    themes.push('tools');
  if (allText.includes('deploy') || allText.includes('production') || allText.includes('hosting'))
    themes.push('deployment');
  if (allText.includes('learn') || allText.includes('study') || allText.includes('beginner'))
    themes.push('learning');

  // Travel/lifestyle themes
  if (allText.includes('travel') || allText.includes('trip') || allText.includes('country'))
    themes.push('travel');
  if (allText.includes('health') || allText.includes('fitness') || allText.includes('exercise'))
    themes.push('health');
  if (allText.includes('photography') || allText.includes('photo') || allText.includes('camera'))
    themes.push('photography');
  if (allText.includes('music') || allText.includes('instrument') || allText.includes('guitar'))
    themes.push('music');

  // Detect progression level
  let progression = 'beginner';
  if (recentHistory.length >= 2) {
    progression = 'intermediate';
  }
  if (allText.includes('advanced') || allText.includes('architecture') || allText.includes('optimization')) {
    progression = 'advanced';
  }

  // Detect topic switch: compare themes from last conversation vs previous
  let topicSwitch = false;
  if (conversationHistory.length >= 2) {
    const lastConvo = conversationHistory[conversationHistory.length - 1];
    const prevConvo = conversationHistory[conversationHistory.length - 2];

    const lastText = `${lastConvo.question} ${lastConvo.answer}`.toLowerCase();
    const prevText = `${prevConvo.question} ${prevConvo.answer}`.toLowerCase();

    // Check if the topics are completely different
    const techKeywords = ['programming', 'code', 'web', 'ai', 'tech', 'software'];
    const lifestyleKeywords = ['travel', 'health', 'photo', 'music', 'cook', 'hobby'];

    const lastIsTech = techKeywords.some(kw => lastText.includes(kw));
    const prevIsTech = techKeywords.some(kw => prevText.includes(kw));
    const lastIsLifestyle = lifestyleKeywords.some(kw => lastText.includes(kw));
    const prevIsLifestyle = lifestyleKeywords.some(kw => prevText.includes(kw));

    topicSwitch = (lastIsTech && !prevIsTech) || (lastIsLifestyle && !prevIsLifestyle);
  }

  return { themes, progression, topicSwitch };
}

/**
 * Gets initial suggestions (no context)
 */
export function getInitialSuggestions() {
  return [
    { question: "What's the best programming language for beginners?", icon: "💻", confidence: 0.95 },
    { question: "How does machine learning work?", icon: "🤖", confidence: 0.92 },
    { question: "How do I switch careers into tech?", icon: "🔄", confidence: 0.90 },
    { question: "What are the most important tech trends?", icon: "📈", confidence: 0.88 }
  ];
}

/**
 * Pattern-based suggestions for specific topics
 */
export const topicPatterns = {
  programming: {
    keywords: ['programming', 'coding', 'language', 'python', 'javascript', 'java'],
    suggestions: [
      { question: "What frameworks should I learn for web development?", icon: "🌐", confidence: 0.93 },
      { question: "How long does it take to become job-ready?", icon: "⏱️", confidence: 0.91 },
      { question: "Should I focus on frontend or backend first?", icon: "🎯", confidence: 0.89 },
      { question: "What are the best resources for learning to code?", icon: "📚", confidence: 0.87 }
    ]
  },

  'ai-ml': {
    keywords: ['ai', 'machine learning', 'artificial intelligence', 'neural', 'model', 'algorithm'],
    suggestions: [
      { question: "What math do I need to know for machine learning?", icon: "📐", confidence: 0.94 },
      { question: "How can I build my first AI project?", icon: "🛠️", confidence: 0.92 },
      { question: "What's the difference between supervised and unsupervised learning?", icon: "🎓", confidence: 0.90 },
      { question: "Which AI tools are best for beginners?", icon: "🔧", confidence: 0.88 }
    ]
  },

  career: {
    keywords: ['career', 'job', 'work', 'switch', 'salary'],
    suggestions: [
      { question: "How do I build a strong tech portfolio?", icon: "💼", confidence: 0.95 },
      { question: "What salary should I expect as a junior developer?", icon: "💰", confidence: 0.91 },
      { question: "Is a computer science degree necessary?", icon: "🎓", confidence: 0.89 },
      { question: "How important are certifications in tech?", icon: "📜", confidence: 0.86 }
    ]
  },

  travel: {
    keywords: ['travel', 'trip', 'country', 'visit', 'japan', 'europe'],
    suggestions: [
      { question: "What are the must-see attractions?", icon: "🗺️", confidence: 0.94 },
      { question: "How much should I budget for this trip?", icon: "💰", confidence: 0.92 },
      { question: "What's the best time of year to visit?", icon: "🌤️", confidence: 0.90 },
      { question: "Do I need a visa or special documents?", icon: "📄", confidence: 0.88 }
    ]
  },

  photography: {
    keywords: ['photography', 'photo', 'camera', 'lens', 'shoot'],
    suggestions: [
      { question: "What camera should I buy as a beginner?", icon: "📷", confidence: 0.95 },
      { question: "How do I understand aperture and shutter speed?", icon: "🔍", confidence: 0.92 },
      { question: "What editing software should I use?", icon: "🎨", confidence: 0.89 },
      { question: "How do I take better portraits?", icon: "👤", confidence: 0.87 }
    ]
  },

  health: {
    keywords: ['health', 'fitness', 'exercise', 'workout', 'diet'],
    suggestions: [
      { question: "What's a good workout routine for beginners?", icon: "💪", confidence: 0.94 },
      { question: "How do I stay motivated to exercise?", icon: "🎯", confidence: 0.91 },
      { question: "What should I eat before and after workouts?", icon: "🥗", confidence: 0.89 },
      { question: "How often should I exercise each week?", icon: "📅", confidence: 0.87 }
    ]
  },

  learning: {
    keywords: ['learn', 'study', 'course', 'practice', 'tutorial'],
    suggestions: [
      { question: "What's the best way to stay motivated while learning?", icon: "💪", confidence: 0.93 },
      { question: "How many hours a day should I practice?", icon: "⏰", confidence: 0.90 },
      { question: "Should I learn by building projects or taking courses?", icon: "🔨", confidence: 0.88 },
      { question: "How do I overcome tutorial hell?", icon: "🎯", confidence: 0.87 }
    ]
  }
};

/**
 * Gets suggestions based on detected themes (most recent question)
 */
export function getThemeBasedSuggestions(previousQuestion, previousAnswer) {
  const combinedText = `${previousQuestion} ${previousAnswer || ''}`.toLowerCase();

  // Find matching theme
  for (const pattern of Object.values(topicPatterns)) {
    if (pattern.keywords.some(keyword => combinedText.includes(keyword))) {
      return pattern.suggestions;
    }
  }

  // Default fallback
  return [
    { question: "Can you explain that in more detail?", icon: "💡", confidence: 0.88 },
    { question: "What are some practical examples?", icon: "🔍", confidence: 0.86 },
    { question: "Where can I learn more about this?", icon: "📚", confidence: 0.84 },
    { question: "What are common mistakes to avoid?", icon: "⚠️", confidence: 0.82 }
  ];
}
