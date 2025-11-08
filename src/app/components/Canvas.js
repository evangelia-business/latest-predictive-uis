"use client";

import { useState, startTransition, useMemo, useCallback } from "react";
import { useAIChat } from "../hooks/useAIChat";
import { formatAnswer } from "../utils/formatters";
import ThoughtItem from "./ThoughtItem";
import SuggestedQuestions from "./SuggestedQuestions";

const Canvas = () => {
  const [showThinking, setShowThinking] = useState(true);

  const {
    question,
    setQuestion,
    aiState,
    suggestions,
    error,
    askQuestion,
    selectSuggestion,
    onMessage,
    handleComplete,
    dispatch,
  } = useAIChat();

  // Set up message handlers
  //#Technique 1 - Streaming with SSE
  onMessage(
    "thinking",
    useCallback(
      (data) => {
        startTransition(() => {
          dispatch({ type: "ADD_THOUGHTS", payload: data.thoughts });
        });
      },
      [dispatch]
    )
  );

  onMessage(
    "streaming",
    useCallback(
      (data) => {
        startTransition(() => {
          dispatch({ type: "STREAMING", payload: data.answer });
        });
      },
      [dispatch]
    )
  );

  onMessage(
    "complete",
    useCallback(
      (data) => {
        startTransition(() => {
          handleComplete(data);
        });
      },
      [handleComplete]
    )
  );

  // Memoize thought items for performance
  const thoughtItems = useMemo(() => {
    return aiState.aiThoughts.map((thought, index) => (
      <ThoughtItem key={index} thought={thought} index={index} />
    ));
  }, [aiState.aiThoughts]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        askQuestion();
      }
    },
    [askQuestion]
  );

  return (
    <div className="ai-chat-container">
      <h1>AI Assistant Demo</h1>

      {/* Question Input */}
      <div className="question-section">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything..."
          className="question-input"
          onKeyDown={handleKeyPress}
        />
        <button onClick={askQuestion} className="ask-button">
          Ask
        </button>
      </div>

      {/* Suggested Questions */}
      <SuggestedQuestions
        suggestions={suggestions}
        onSelectQuestion={selectSuggestion}
        isVisible={!aiState.isThinking && suggestions.length > 0}
      />

      {/* Thinking Panel */}
      {(aiState.isThinking ||
        (aiState.aiThoughts.length > 0 && !aiState.isComplete)) && (
        <div className="thinking-panel">
          <div className="thinking-header">
            <span>🧠 AI is thinking...</span>
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="toggle-thinking"
            >
              {showThinking ? "Hide" : "Show"} thinking
            </button>
          </div>

          {showThinking && (
            <div className="thought-stream">
              {thoughtItems}
              {aiState.isThinking && (
                <div className="thinking-indicator">...</div>
              )}
              <div className="gradient-overlay"></div>
            </div>
          )}
        </div>
      )}

      {/* Final Answer */}
      {aiState.finalAnswer && (
        <div className="final-answer">
          <div className="answer-header">
            <h3>Answer:</h3>
            {aiState.usedCache && (
              <span className="cache-indicator">⚡ Loaded from cache</span>
            )}
            {!aiState.isComplete && (
              <span className="streaming-indicator">✍️ Writing...</span>
            )}
          </div>
          <div className="answer-content">
            {formatAnswer(aiState.finalAnswer)}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>Connection error: {error.message}</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
