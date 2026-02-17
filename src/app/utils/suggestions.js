// Utility functions for generating AI-powered context-aware question suggestions

/**
 * Fetches AI-generated suggestions from the API
 */
export async function generateAISuggestions(context = {}) {
  const { previousQuestion, previousAnswer, conversationHistory, hasAskedBefore } = context;

  try {
    // If no previous context, get initial suggestions
    if (!hasAskedBefore || !previousQuestion) {
      const response = await fetch('/api/suggestions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch initial suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    }

    // Fetch contextual suggestions based on previous Q&A
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        previousQuestion,
        previousAnswer,
        conversationHistory: conversationHistory || []
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contextual suggestions');
    }

    const data = await response.json();
    return data.suggestions;

  } catch (error) {
    console.error('Error generating AI suggestions:', error);

    // Fallback to hardcoded suggestions if API fails
    return getFallbackSuggestions(context);
  }
}

/**
 * Fallback suggestions if API fails (legacy system)
 */
function getFallbackSuggestions(context) {
  const { hasAskedBefore } = context;

  if (!hasAskedBefore) {
    return [
      { question: "What's the best programming language for beginners?", icon: "💻" },
      { question: "How does machine learning work?", icon: "🤖" },
      { question: "How do I switch careers into tech?", icon: "🔄" },
      { question: "What are the most important tech trends?", icon: "📈" }
    ];
  }

  return [
    { question: "What skills should I prioritize learning?", icon: "🎯" },
    { question: "How do I stay updated with tech changes?", icon: "📰" },
    { question: "What are common mistakes beginners make?", icon: "⚠️" }
  ];
}

/**
 * Main function for generating suggestions
 * Now uses AI API instead of hardcoded patterns
 */
export function generateSuggestions(context = {}) {
  // Return a Promise that resolves to AI-generated suggestions
  return generateAISuggestions(context);
}
