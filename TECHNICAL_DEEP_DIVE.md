# Technical Deep Dive: SSE and Streaming Patterns

## Overview
This document provides in-depth technical details for the "From Reactive to Predictive" presentation, covering Server-Sent Events, React patterns, and streaming architecture.

---

## 1. Server-Sent Events (SSE) Fundamentals

### What is SSE?

Server-Sent Events is a W3C specification that enables servers to push data to web clients over HTTP. Unlike WebSockets, it's **unidirectional** (server → client) and uses regular HTTP connections.

### Protocol Specification

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: This is a message\n\n
data: Another message\n\n
```

**Key characteristics:**
- Messages start with `data:`
- Messages end with double newline (`\n\n`)
- Supports named events with `event:` field
- Automatic reconnection with `retry:` field
- Last event ID tracking with `id:` field

### Browser Support

```javascript
if ('EventSource' in window) {
  const eventSource = new EventSource('/api/stream');
  // Supported
} else {
  // Fallback to polling
}
```

**Support:** All modern browsers (IE 11- requires polyfill)

---

## 2. Implementation Details

### Server-Side: Next.js API Route

```javascript
// app/api/socket/route.js
export async function GET(req) {
  // 1. Set SSE headers
  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache, no-transform");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no"); // Disable nginx buffering

  // 2. Parse query parameters
  const url = new URL(req.url);
  const question = url.searchParams.get('question') || 'general inquiry';

  // 3. Create ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      let stepIndex = 0;
      let interval = null;
      let isComplete = false;
      const currentThoughts = [];

      // Generate contextual steps
      const contextualSteps = generateSteps(question);
      const finalAnswer = generateAnswer(question);

      // 4. Streaming loop
      interval = setInterval(() => {
        try {
          if (isComplete) {
            clearInterval(interval);
            return;
          }

          if (stepIndex < contextualSteps.length) {
            // Add new thought
            currentThoughts.push(contextualSteps[stepIndex]);

            // Send update
            const message = JSON.stringify({
              type: 'thinking',
              thoughts: [...currentThoughts],
              step: stepIndex + 1,
              total: contextualSteps.length
            });

            controller.enqueue(`data: ${message}\n\n`);
            stepIndex++;
          } else {
            // Send final answer
            const message = JSON.stringify({
              type: 'complete',
              answer: finalAnswer
            });

            controller.enqueue(`data: ${message}\n\n`);
            isComplete = true;
            clearInterval(interval);

            // Close stream
            setTimeout(() => {
              try {
                controller.close();
              } catch (error) {
                console.log('Controller already closed');
              }
            }, 100);
          }
        } catch (error) {
          console.error('Stream error:', error);
          clearInterval(interval);

          // Send error
          const errorMessage = JSON.stringify({
            type: 'error',
            message: error.message
          });

          try {
            controller.enqueue(`data: ${errorMessage}\n\n`);
            controller.error(error);
          } catch (e) {
            console.log('Controller already errored');
          }
        }
      }, 1500); // Update every 1.5 seconds

      // 5. Cleanup function
      return () => {
        isComplete = true;
        if (interval) {
          clearInterval(interval);
        }
      };
    },

    cancel() {
      console.log('Stream cancelled by client');
    }
  });

  // 6. Return Response with stream
  return new Response(stream, { headers });
}
```

### Key Implementation Details

#### ReadableStream Controller Methods

```javascript
// Enqueue data
controller.enqueue(chunk); // Add data to stream

// Close stream
controller.close(); // Signal end of stream

// Error handling
controller.error(error); // Signal error to client

// Desired size (backpressure)
controller.desiredSize; // How much client can handle
```

#### Message Formatting

```javascript
// Simple message
const message = `data: ${JSON.stringify({ type: 'thinking' })}\n\n`;

// Multi-line message
const message = `data: Line 1\ndata: Line 2\ndata: Line 3\n\n`;

// Named event
const message = `event: custom\ndata: ${JSON.stringify({})}\n\n`;

// With ID for reconnection
const message = `id: 123\ndata: ${JSON.stringify({})}\n\n`;
```

#### Error Handling Strategies

```javascript
// 1. Graceful error messages
controller.enqueue(`data: ${JSON.stringify({
  type: 'error',
  message: 'User-friendly error',
  code: 'ERROR_CODE'
})}\n\n`);

// 2. Retry logic
headers.set("retry", "3000"); // Retry after 3 seconds

// 3. Cleanup on error
try {
  // Streaming logic
} catch (error) {
  clearInterval(interval);
  controller.error(error);
}
```

---

## 3. Client-Side: React Implementation

### Custom Hook: useServerSentEvents

```javascript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const useServerSentEvents = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const handlersRef = useRef({});

  const connect = useCallback((url) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setError(null);
    setIsConnected(false);

    // Create new EventSource
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
      setError(null);
    };

    // Message received
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = handlersRef.current[data.type];
        if (handler) {
          handler(data);
        } else {
          console.warn('No handler for message type:', data.type);
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
        setError(err);
      }
    };

    // Error occurred
    eventSource.onerror = (event) => {
      console.error('SSE error:', event);
      setError(new Error('Connection failed'));
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
    };

    return eventSource;
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const onMessage = useCallback((type, handler) => {
    handlersRef.current[type] = handler;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    onMessage,
    isConnected,
    error
  };
};
```

### Why This Hook Design?

**Benefits:**
1. **Encapsulation** - EventSource logic hidden from components
2. **Lifecycle management** - Auto cleanup prevents memory leaks
3. **Type-based routing** - Clean handler registration
4. **Reusability** - Use in any component
5. **Testability** - Easy to mock EventSource

**Usage:**
```javascript
const { connect, disconnect, onMessage, isConnected, error } = useServerSentEvents();

// Register handlers
onMessage('thinking', (data) => {
  console.log('Thinking:', data.thoughts);
});

onMessage('complete', (data) => {
  console.log('Complete:', data.answer);
});

// Connect
connect('/api/socket?question=test');
```

---

## 4. State Management with useReducer

### Why useReducer Over useState?

**Problem with useState:**
```javascript
// Multiple setState calls = multiple re-renders
const [thoughts, setThoughts] = useState([]);
const [thinking, setThinking] = useState(false);
const [answer, setAnswer] = useState('');
const [complete, setComplete] = useState(false);

// Easy to get into inconsistent state
setThinking(true);
setThoughts([]);
// What if error happens here?
setAnswer('');
setComplete(false);
```

**Solution with useReducer:**
```javascript
// Single dispatch = atomic state transition
const [state, dispatch] = useReducer(aiReducer, initialState);

dispatch({ type: 'START_THINKING' }); // All state updated atomically
```

### Reducer Implementation

```javascript
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
        finalAnswer: '',
        isComplete: false,
        isThinking: true
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
        isThinking: false,
        error: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};
```

### Testing Reducers

```javascript
describe('aiReducer', () => {
  it('should start thinking', () => {
    const state = aiReducer(initialState, { type: 'START_THINKING' });
    expect(state.isThinking).toBe(true);
    expect(state.aiThoughts).toEqual([]);
  });

  it('should add thoughts', () => {
    const state = aiReducer(initialState, {
      type: 'ADD_THOUGHTS',
      payload: ['Thought 1', 'Thought 2']
    });
    expect(state.aiThoughts).toEqual(['Thought 1', 'Thought 2']);
  });

  it('should complete', () => {
    const state = aiReducer(initialState, {
      type: 'COMPLETE',
      payload: 'Final answer'
    });
    expect(state.isThinking).toBe(false);
    expect(state.isComplete).toBe(true);
    expect(state.finalAnswer).toBe('Final answer');
  });
});
```

---

## 5. React Concurrent Features

### startTransition

```javascript
import { startTransition } from 'react';

onMessage('thinking', useCallback((data) => {
  startTransition(() => {
    dispatch({ type: 'ADD_THOUGHTS', payload: data.thoughts });
  });
}, [dispatch]));
```

**What it does:**
- Marks state update as **non-urgent**
- React can interrupt it for urgent updates (user input)
- Keeps UI responsive during heavy renders
- Prevents janky animations

**When to use:**
- Streaming updates
- Large list renders
- Background data fetching
- Non-critical UI updates

**When NOT to use:**
- User input handlers
- Controlled form fields
- Critical state updates
- Immediate feedback needed

### Performance Optimization

```javascript
// 1. Memoize expensive computations
const thoughtItems = useMemo(() => {
  return aiState.aiThoughts.map((thought, index) => (
    <ThoughtItem key={index} thought={thought} index={index} />
  ));
}, [aiState.aiThoughts]);

// 2. Stabilize callbacks
const handleAskQuestion = useCallback(() => {
  if (!question.trim()) return;

  startTransition(() => {
    dispatch({ type: 'START_THINKING' });
  });

  const encodedQuestion = encodeURIComponent(question);
  connect(`/api/socket?question=${encodedQuestion}`);
}, [question, connect, dispatch]);

// 3. Prevent unnecessary renders
const ThoughtItem = React.memo(({ thought, index }) => {
  return <div className="thought-item">{thought}</div>;
});
```

---

## 6. Production Considerations

### Integrating with Real AI APIs

#### OpenAI Streaming

```javascript
export async function GET(req) {
  const url = new URL(req.url);
  const question = url.searchParams.get('question');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
      stream: true
    })
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;

              if (content) {
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'token',
                  content
                })}\n\n`);
              }
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

#### Ollama Local Model

```javascript
export async function GET(req) {
  const url = new URL(req.url);
  const question = url.searchParams.get('question');

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'phi3:mini',
      prompt: question,
      stream: true
    })
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const json = JSON.parse(chunk);

        if (json.response) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'token',
            content: json.response
          })}\n\n`);
        }

        if (json.done) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'complete'
          })}\n\n`);
          controller.close();
          break;
        }
      }
    }
  });

  return new Response(stream, { headers: sseHeaders });
}
```

### Error Recovery

```javascript
// Client-side reconnection
const connect = useCallback((url, retries = 3) => {
  const eventSource = new EventSource(url);

  eventSource.onerror = (event) => {
    console.error('SSE error:', event);
    eventSource.close();

    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      setTimeout(() => {
        connect(url, retries - 1);
      }, 3000);
    } else {
      setError(new Error('Connection failed after retries'));
    }
  };

  return eventSource;
}, []);
```

### Rate Limiting

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Continue with SSE stream
}
```

### Monitoring

```javascript
// Server-side
export async function GET(req) {
  const startTime = Date.now();

  const stream = new ReadableStream({
    start(controller) {
      let messageCount = 0;

      const interval = setInterval(() => {
        messageCount++;
        // Send message
        controller.enqueue(`data: ${JSON.stringify({})}\n\n`);
      }, 1500);

      return () => {
        const duration = Date.now() - startTime;
        console.log(`Stream closed after ${duration}ms, ${messageCount} messages sent`);

        // Send to analytics
        analytics.track('sse_stream_complete', {
          duration,
          messageCount,
          question: req.url
        });
      };
    }
  });

  return new Response(stream, { headers });
}
```

---

## 7. Debugging Tips

### Network Tab

1. Open Chrome DevTools → Network tab
2. Filter by "EventSource" or look for `text/event-stream`
3. Click on the connection
4. View "EventStream" tab to see messages in real-time

### Console Logging

```javascript
// Server
controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
console.log('Sent:', message);

// Client
eventSource.onmessage = (event) => {
  console.log('Received:', event.data);
  const data = JSON.parse(event.data);
  console.log('Parsed:', data);
};
```

### React DevTools

1. Install React DevTools extension
2. Open Components tab
3. Select Canvas component
4. Watch state updates in real-time
5. Check hooks: useReducer, useServerSentEvents

---

## 8. Comparison Table

| Feature | SSE | WebSockets | Long Polling |
|---------|-----|------------|--------------|
| Direction | Server → Client | Bidirectional | Client → Server |
| Protocol | HTTP | WebSocket | HTTP |
| Connection | Keep-alive | Persistent | Multiple requests |
| Reconnection | Automatic | Manual | N/A |
| Browser Support | 98% | 99% | 100% |
| Serverless | ✅ Yes | Limited | ✅ Yes |
| Complexity | Low | Medium | Low |
| Latency | Low | Very low | High |
| Bandwidth | Efficient | Very efficient | Wasteful |
| Use Case | AI streaming, notifications | Chat, gaming | Legacy support |

---

## Conclusion

This technical architecture provides a foundation for building transparent, streaming UIs. The patterns shown here work with:
- Simulated responses (current demo)
- Real AI APIs (OpenAI, Anthropic)
- Local models (Ollama, WebLLM)
- Any streaming backend

The React patterns (useReducer, custom hooks, concurrent features) remain consistent regardless of the data source.
