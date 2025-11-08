'use client';

import { useCallback, useRef } from 'react';

/**
 * Hook for prefetching and caching question answers
 */
export const usePrefetch = () => {
  const cacheRef = useRef(new Map());
  const prefetchingRef = useRef(new Set());

  /**
   * Prefetches an answer for a given question
   */
  const prefetch = useCallback(async (question) => {
    if (!question || !question.trim()) return;

    const normalizedQuestion = question.trim().toLowerCase();

    // Already cached or currently prefetching
    if (cacheRef.current.has(normalizedQuestion) || prefetchingRef.current.has(normalizedQuestion)) {
      return;
    }

    prefetchingRef.current.add(normalizedQuestion);

    console.log('🔄 [PREFETCH] Starting prefetch for:', question);

    try {
      const encodedQuestion = encodeURIComponent(question);
      const eventSource = new EventSource(`/api/socket?question=${encodedQuestion}`);

      const cachedData = {
        thoughts: [],
        answer: null,
        isComplete: false,
        timestamp: Date.now()
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'thinking') {
            cachedData.thoughts = data.thoughts;
          } else if (data.type === 'complete') {
            cachedData.answer = data.answer;
            cachedData.isComplete = true;

            // Store in cache
            cacheRef.current.set(normalizedQuestion, cachedData);

            console.log('✅ [PREFETCH] Cached answer for:', question);
            console.log('📦 [CACHE DATA]', {
              question: question,
              answerLength: cachedData.answer?.length,
              thoughtsCount: cachedData.thoughts?.length,
              timestamp: new Date(cachedData.timestamp).toLocaleTimeString()
            });

            // Close connection
            eventSource.close();
            prefetchingRef.current.delete(normalizedQuestion);
          }
        } catch (err) {
          console.error('Prefetch parse error:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        prefetchingRef.current.delete(normalizedQuestion);
      };

    } catch (error) {
      console.error('Prefetch error:', error);
      prefetchingRef.current.delete(normalizedQuestion);
    }
  }, []);

  /**
   * Prefetches multiple questions
   */
  const prefetchBatch = useCallback((questions) => {
    if (!Array.isArray(questions)) return;

    // Sort by confidence score (highest first), then take top 2
    const sortedByConfidence = [...questions].sort((a, b) => {
      const confidenceA = typeof a === 'object' ? (a.confidence || 0) : 0;
      const confidenceB = typeof b === 'object' ? (b.confidence || 0) : 0;
      return confidenceB - confidenceA;
    });

    const topQuestions = sortedByConfidence.slice(0, 2);
    console.log('🎯 [PREFETCH BATCH] Prefetching top 2 by confidence:',
      topQuestions.map(q => ({
        question: typeof q === 'string' ? q : q?.question,
        confidence: typeof q === 'object' ? q?.confidence : 'N/A'
      }))
    );

    // Prefetch top 2 highest confidence questions
    topQuestions.forEach((q) => {
      if (typeof q === 'string') {
        prefetch(q);
      } else if (q && q.question) {
        prefetch(q.question);
      }
    });
  }, [prefetch]);

  /**
   * Gets cached data for a question if available
   */
  const getCached = useCallback((question) => {
    if (!question) return null;
    const normalizedQuestion = question.trim().toLowerCase();
    const cached = cacheRef.current.get(normalizedQuestion);

    if (cached) {
      console.log('⚡ [CACHE HIT] Retrieved from cache:', question);
      console.log('📦 [CACHED DATA]', {
        question: question,
        answerPreview: cached.answer?.substring(0, 100) + '...',
        thoughtsCount: cached.thoughts?.length,
        age: `${Math.round((Date.now() - cached.timestamp) / 1000)}s ago`
      });
    }

    return cached || null;
  }, []);

  /**
   * Clears the cache (useful for demos/testing)
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    prefetchingRef.current.clear();
  }, []);

  /**
   * Gets cache statistics for monitoring
   */
  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      prefetching: prefetchingRef.current.size,
      questions: Array.from(cacheRef.current.keys())
    };
  }, []);

  return {
    prefetch,
    prefetchBatch,
    getCached,
    clearCache,
    getCacheStats
  };
};
