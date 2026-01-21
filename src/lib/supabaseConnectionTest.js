
import { supabase } from './customSupabaseClient';

/**
 * Tests the connection to Supabase by making a lightweight query.
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function testConnection() {
  try {
    // We try to fetch the server time or just a simple query from a public table
    // Since we might not know which tables are public, we'll try a very basic check.
    // Checking auth session is a good start, or querying 'projects' with limit 1 if we have access.
    
    // Attempt 1: Check if client is initialized properly
    if (!supabase || !supabase.from) {
        return {
            success: false,
            message: "Supabase client is not initialized properly.",
            error: "Client initialization failed"
        };
    }

    // Attempt 2: Make a simple network request. 
    // We'll try to select from 'projects' (briefs) since that's the main context.
    // using head: true to minimize data transfer.
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If we get a permission error, we are at least connected to the endpoint.
      // But if we get a fetch error or URL error, connection is broken.
      // 401 means Unauthorized (bad key), which is a "connection success" in terms of network,
      // but failure for app usage.
      
      console.warn("Supabase connection test warning:", error);

      if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
         // JWT error or Permission denied often means key is invalid or expired
         return {
            success: false,
            message: "Sunucuya erişim reddedildi. API anahtarlarınızı kontrol edin.",
            error: error.message
         };
      }
      
      return {
        success: false,
        message: "Supabase bağlantısı kurulamadı.",
        error: error.message
      };
    }

    return {
      success: true,
      message: "Supabase bağlantısı başarılı."
    };

  } catch (err) {
    console.error("Unexpected error during connection test:", err);
    return {
      success: false,
      message: "Beklenmeyen bir bağlantı hatası oluştu.",
      error: err.message
    };
  }
}
