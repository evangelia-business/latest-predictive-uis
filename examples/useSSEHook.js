// Custom Hook: useServerSentEvents
// Encapsulates EventSource connection lifecycle

export const useServerSentEvents = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const handlersRef = useRef({});

  const connect = useCallback((url) => {
    // Close existing connection first
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => setIsConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = handlersRef.current[data.type];
        if (handler) handler(data);
      } catch (err) {
        setError(err);
      }
    };

    eventSource.onerror = () => {
      setError(new Error('Connection failed'));
      setIsConnected(false);
      eventSource.close();
    };
  }, []);

  const onMessage = useCallback((type, handler) => {
    handlersRef.current[type] = handler;
  }, []);

  return { connect, onMessage, isConnected, error };
};

// Usage:
const { connect, onMessage, isConnected, error } = useServerSentEvents();

onMessage('thinking', (data) => {
  console.log('New thoughts:', data.thoughts);
});

onMessage('complete', (data) => {
  console.log('Final answer:', data.answer);
});

connect('/api/socket?question=How+does+AI+work');
