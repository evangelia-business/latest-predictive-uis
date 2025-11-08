'use client';

import { memo } from 'react';

const SuggestedQuestions = memo(({ suggestions, onSelectQuestion, isVisible }) => {
  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggested-questions">
      <div className="suggestions-header">
        <span className="suggestions-icon">💡</span>
        <span>Suggested questions</span>
      </div>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-chip"
            onClick={() => onSelectQuestion(suggestion.question)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="suggestion-icon">{suggestion.icon}</span>
            <span className="suggestion-text">{suggestion.question}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestedQuestions.displayName = 'SuggestedQuestions';

export default SuggestedQuestions;
