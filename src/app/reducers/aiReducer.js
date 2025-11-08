/**
 * Initial state for AI chat
 */
export const initialState = {
  aiThoughts: [],
  isThinking: false,
  finalAnswer: "",
  isComplete: false,
  usedCache: false,
};

/**
 * Reducer for managing AI chat state
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} - New state
 */
export const aiReducer = (state, action) => {
  switch (action.type) {
    case "START_THINKING":
      return startThinking(state);

    case "ADD_THOUGHTS":
      return addThoughts(state, action.payload);

    case "STREAMING":
      return updateStreaming(state, action.payload);

    case "COMPLETE":
      return completeAnswer(state, action.payload, action.usedCache);

    case "LOAD_FROM_CACHE":
      return loadFromCache(state, action.payload);

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

/**
 * Start thinking state - reset for new question
 */
const startThinking = (state) => ({
  ...state,
  aiThoughts: [],
  finalAnswer: "",
  isComplete: false,
  isThinking: true,
  usedCache: false,
});

/**
 * Add new thoughts to the stream
 */
const addThoughts = (state, thoughts) => ({
  ...state,
  aiThoughts: thoughts,
  isThinking: true,
});

/**
 * Update answer while streaming
 */
const updateStreaming = (state, answer) => ({
  ...state,
  finalAnswer: answer,
  isThinking: false,
  isComplete: false,
});

/**
 * Complete the answer
 */
const completeAnswer = (state, answer, usedCache = false) => ({
  ...state,
  finalAnswer: answer,
  isThinking: false,
  isComplete: true,
  usedCache,
});

/**
 * Load answer from cache
 */
const loadFromCache = (state, payload) => ({
  ...state,
  aiThoughts: payload.thoughts,
  finalAnswer: payload.answer,
  isThinking: false,
  isComplete: true,
  usedCache: true,
});
