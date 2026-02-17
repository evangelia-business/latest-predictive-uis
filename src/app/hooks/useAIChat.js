import { useCallback, useReducer, useState, useEffect } from "react";
import { useServerSentEvents } from "./useServerSentEvents";
import { usePrefetch } from "./usePrefetch";
import { generateSuggestions } from "../utils/suggestions";
import { aiReducer, initialState } from "../reducers/aiReducer";

/**
 * Custom hook for managing AI chat interactions
 * Handles state, SSE connections, caching, and suggestions
 */
export const useAIChat = () => {
  const [question, setQuestion] = useState("");
  const [aiState, dispatch] = useReducer(aiReducer, initialState);
  const [suggestions, setSuggestions] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const { connect, disconnect, onMessage, error } = useServerSentEvents();
  const { prefetchBatch, getCached } = usePrefetch();

  // Initialize suggestions on mount
  useEffect(() => {
    loadInitialSuggestions();
  }, []);

  // Prefetch suggestions whenever they change
  useEffect(() => {
    if (suggestions.length > 0 && !aiState.isThinking) {
      prefetchBatch(suggestions);
    }
  }, [suggestions, prefetchBatch, aiState.isThinking]);

  /**
   * Load initial suggestions when component mounts
   */
  const loadInitialSuggestions = async () => {
    const initialSuggestions = await generateSuggestions({
      hasAskedBefore: false,
    });
    setSuggestions(initialSuggestions);
  };

  /**
   * Update suggestions after answering a question
   */
  const updateSuggestionsAfterAnswer = async (
    answeredQuestion,
    answer,
    updatedHistory
  ) => {
    // Clear old suggestions while loading new ones
    setSuggestions([]);

    const newSuggestions = await generateSuggestions({
      previousQuestion: answeredQuestion,
      previousAnswer: answer,
      conversationHistory: updatedHistory,
      hasAskedBefore: true,
    });
    setSuggestions(newSuggestions);
  };

  /**
   * Add question and answer to conversation history
   */
  const addToHistory = useCallback(
    (question, answer) => {
      const newHistoryEntry = {
        question,
        answer,
        timestamp: Date.now(),
      };
      const updatedHistory = [...conversationHistory, newHistoryEntry];
      setConversationHistory(updatedHistory);
      return updatedHistory;
    },
    [conversationHistory]
  );

  /**
   * Handle completion of answer from server
   */
  const handleComplete = useCallback(
    async (data) => {
      dispatch({ type: "COMPLETE", payload: data.answer });
      disconnect();

      const updatedHistory = addToHistory(question, data.answer);
      await updateSuggestionsAfterAnswer(question, data.answer, updatedHistory);
    },
    [question, addToHistory, disconnect]
  );

  /**
   * Handle cached answer loading
   */
  const handleCachedAnswer = useCallback(
    async (cached, questionText) => {
      console.log("⚡ [INSTANT LOAD] Using cached answer - no API call needed!");
      console.log(
        "⏱️ [PERFORMANCE] Load time: ~0ms (vs 3-10s for fresh API call)"
      );

      dispatch({
        type: "LOAD_FROM_CACHE",
        payload: cached,
      });

      const updatedHistory = addToHistory(questionText, cached.answer);
      await updateSuggestionsAfterAnswer(
        questionText,
        cached.answer,
        updatedHistory
      );
    },
    [addToHistory]
  );

  /**
   * Handle fresh API call
   */
  const handleFreshAPICall = useCallback(
    (questionText) => {
      console.log("🌐 [FRESH API CALL] Not cached - fetching from server...");

      dispatch({ type: "START_THINKING" });

      const encodedQuestion = encodeURIComponent(questionText);
      connect(`/api/socket?question=${encodedQuestion}`);
    },
    [connect]
  );

  /**
   * Ask a question - checks cache first, then makes API call
   */
  const askQuestion = useCallback(async () => {
    if (!question.trim()) return;

    const cached = getCached(question);

    if (cached && cached.isComplete) {
      await handleCachedAnswer(cached, question);
    } else {
      handleFreshAPICall(question);
    }
  }, [question, getCached, handleCachedAnswer, handleFreshAPICall]);

  /**
   * Handle selecting a suggested question
   */
  const selectSuggestion = useCallback(
    async (suggestedQuestion) => {
      setQuestion(suggestedQuestion);

      // Automatically ask the question after a brief moment
      setTimeout(async () => {
        const cached = getCached(suggestedQuestion);

        if (cached && cached.isComplete) {
          await handleCachedAnswer(cached, suggestedQuestion);
        } else {
          handleFreshAPICall(suggestedQuestion);
        }
      }, 100);
    },
    [getCached, handleCachedAnswer, handleFreshAPICall]
  );

  return {
    // State
    question,
    setQuestion,
    aiState,
    suggestions,
    error,

    // Actions
    askQuestion,
    selectSuggestion,
    dispatch,

    // Message handlers
    onMessage,
    handleComplete,
  };
};
