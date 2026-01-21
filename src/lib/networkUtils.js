import { handleSupabaseError, showSupabaseErrorToast } from '@/lib/supabaseErrorHandler';
import { connectionManager } from '@/lib/supabaseConnectionManager';
import { supabase } from '@/lib/customSupabaseClient';

// Configuration
const DEFAULT_TIMEOUT = 20000; 
const MAX_RETRIES = 2;
const BASE_DELAY = 1000;
const CACHE_TTL = 5 * 60 * 1000;

// Caches
const requestCache = new Map();
const pendingRequests = new Map();

export const timeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT_ERROR'));
    }, ms);
  });
};

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Enhanced safeQuery with Connection Manager Integration and 401 Handling
 */
export const safeQuery = async (queryFn, options = {}) => {
  const { 
    retries = MAX_RETRIES, 
    timeoutMs = DEFAULT_TIMEOUT,
    errorMessage = 'Veri alınırken bir hata oluştu.',
    fallbackValue = undefined,
    silent = false,
    key = null,
    ttl = CACHE_TTL,
    forceRefresh = false,
    errorTitle = 'İşlem Başarısız'
  } = options;

  // 1. Connection Check
  if (!isOnline()) {
    const error = new Error('OFFLINE_ERROR');
    if (!silent) showSupabaseErrorToast(error, 'Bağlantı Hatası');
    return { data: fallbackValue ?? null, error };
  }

  // 2. Cache Check
  if (key && !forceRefresh && requestCache.has(key)) {
    const cached = requestCache.get(key);
    if (Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    requestCache.delete(key);
  }

  // 3. Request Deduplication
  if (key && pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const executeQuery = async () => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Ensure connection before trying (skip on first attempt to be optimistic)
        if (attempt > 0) {
            await connectionManager.ensureConnected();
        }

        const result = await Promise.race([
          queryFn(),
          timeoutPromise(timeoutMs)
        ]);

        if (result && result.error) throw result.error;
        
        // Success!
        if (connectionManager) connectionManager.notifyListeners(true);
        return result;

      } catch (error) {
        lastError = error;
        
        // 401 Handling - Unauthorized / Session Expired
        if (error.status === 401 || (error.message && error.message.includes('JWT'))) {
          console.warn('[safeQuery] 401 Detected, attempting session refresh...');
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && session) {
             // Retry immediately with new session
             continue;
          } else {
             // Refresh failed, user needs to login. Stop retrying.
             break;
          }
        }

        // Notify connection manager of failure
        if (connectionManager && typeof connectionManager.handleConnectionError === 'function') {
            connectionManager.handleConnectionError(error);
        }

        const handledError = handleSupabaseError(error);
        const isRetryable = 
          handledError.type === 'network' || 
          handledError.type === 'timeout' || 
          (error.status >= 500 && error.status < 600);

        if (!isRetryable || attempt === retries) break;

        const delay = (BASE_DELAY * Math.pow(2, attempt)) + (Math.random() * 200);
        console.warn(`[safeQuery] Retry ${attempt + 1}/${retries} for ${key || 'query'}. Waiting ${Math.round(delay)}ms...`);
        await wait(delay);
      }
    }

    // Final Error Logging & UI Feedback
    if (!silent && lastError?.code !== 'PGRST116') {
      console.error('[safeQuery] Final Error:', lastError);
      showSupabaseErrorToast(lastError, errorTitle);
    }

    return { data: fallbackValue ?? null, error: lastError };
  };

  const promise = executeQuery();

  if (key) {
    pendingRequests.set(key, promise);
  }

  try {
    const result = await promise;
    if (key && !result.error && result.data) {
      requestCache.set(key, { timestamp: Date.now(), data: result });
    }
    return result;
  } finally {
    if (key) pendingRequests.delete(key);
  }
};

export const clearNetworkCache = () => {
  requestCache.clear();
};