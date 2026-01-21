
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Validates the Supabase connection on application startup.
 * Checks for client initialization and performs a connectivity test.
 * 
 * @returns {Promise<{success: boolean, error?: string, details?: any}>}
 */
export const validateSupabaseConnection = async () => {
  try {
    // Perform a lightweight connectivity test
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      // If status is 0, it usually means network error or CORS
      if (error.status === 0 || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network Error',
          details: 'Could not reach Supabase servers. Check your internet connection.'
        };
      }
      
      // Other auth errors usually mean the client reached the server but was rejected
      // which counts as "connected" for our purposes (bad keys is a different issue, 
      // but usually safeQuery handles those errors gracefully later)
      return {
        success: false,
        error: 'Authentication Service Error',
        details: error.message
      };
    }

    return { success: true };

  } catch (err) {
    console.error('[SupabaseValidator] Unexpected error:', err);
    return {
      success: false,
      error: 'Unexpected Connection Error',
      details: err.message
    };
  }
};
