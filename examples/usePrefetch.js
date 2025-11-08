// Smart Prefetching Hook
// Only prefetch top 2 suggestions by confidence score

export const usePrefetch = () => {
  const cacheRef = useRef({});

  const prefetchBatch = useCallback((suggestions) => {
    // Sort by confidence score (highest first)
    const sorted = [...suggestions].sort((a, b) =>
      (b.confidence || 0) - (a.confidence || 0)
    );

    // Only prefetch TOP 2 (smart, not wasteful!)
    const topTwo = sorted.slice(0, 2);

    console.log('🎯 [PREFETCH BATCH] Prefetching top 2 by confidence');

    topTwo.forEach(suggestion => {
      const url = `/api/socket?question=${encodeURIComponent(
        suggestion.question
      )}`;

      // Start prefetching in background
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'complete') {
          // Cache the result
          cacheRef.current[suggestion.question] = {
            answer: data.answer,
            thoughts: data.thoughts,
            isComplete: true
          };
          console.log('✅ [PREFETCH] Cached answer');
          eventSource.close();
        }
      };
    });
  }, []);

  const getCached = useCallback((question) => {
    return cacheRef.current[question];
  }, []);

  return { prefetchBatch, getCached };
};
