
import { useState, useEffect, useCallback, useRef } from 'react';
import { safeQuery } from '@/lib/networkUtils';

/**
 * A custom hook for optimized data fetching with memoization, 
 * abort control, and loading states.
 *
 * @param {Function} fetchFn - The async function to fetch data (must return { data, error })
 * @param {Array} dependencies - Dependency array for re-fetching
 * @param {Object} options - Options object
 * @param {boolean} options.enabled - Whether to fetch automatically (default: true)
 * @param {any} options.initialData - Initial data (default: [])
 * @param {string} options.cacheKey - Optional cache key for the safeQuery utility
 * @param {number} options.ttl - Cache TTL in ms
 */
export const useLazyLoad = (fetchFn, dependencies = [], options = {}) => {
  const { 
    enabled = true, 
    initialData = [],
    cacheKey = null,
    ttl = 60000 
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    // Cancel previous request if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      // safeQuery handles basic networking, retry, and caching logic internally
      // We pass the signal if fetchFn supports it, but safeQuery wrapping makes it tricky.
      // Usually fetchFn inside here calls safeQuery.
      
      const result = await fetchFn();
      
      // Check for abort before state update
      if (abortControllerRef.current?.signal.aborted) return;

      if (result.error) {
        throw result.error;
      }

      setData(result.data || initialData);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("useLazyLoad Error:", err);
      setError(err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFn, initialData]); // fetchFn should be memoized by consumer if it changes

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => fetchData(true);

  return { data, loading, error, refresh, setData };
};
