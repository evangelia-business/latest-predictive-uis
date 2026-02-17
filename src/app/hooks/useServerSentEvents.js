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

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = handlersRef.current[data.type];
        if (handler) {
          handler(data);
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
        setError(err);
      }
    };

    eventSource.onerror = (event) => {
      // readyState CLOSED means the stream ended (normal after server sends complete)
      // readyState CONNECTING means an actual connection failure
      if (eventSource.readyState === EventSource.CONNECTING) {
        console.error('SSE connection error:', event);
        setError(new Error('Connection failed'));
      }
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