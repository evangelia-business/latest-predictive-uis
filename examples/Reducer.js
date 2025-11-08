// State Management with useReducer
// Beyond loading/success/error

const initialState = {
  aiThoughts: [],
  isThinking: false,
  finalAnswer: '',
  isComplete: false
};

const aiReducer = (state, action) => {
  switch (action.type) {
    case 'START_THINKING':
      return {
        ...state,
        aiThoughts: [],
        isThinking: true,
        isComplete: false
      };

    case 'ADD_THOUGHTS':
      return {
        ...state,
        aiThoughts: action.payload,
        isThinking: true
      };

    case 'COMPLETE':
      return {
        ...state,
        finalAnswer: action.payload,
        isThinking: false,
        isComplete: true
      };

    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        isThinking: false
      };

    default:
      return state;
  }
};

// Usage
const [state, dispatch] = useReducer(aiReducer, initialState);
