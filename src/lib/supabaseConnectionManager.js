import { supabase } from './customSupabaseClient';

class SupabaseConnectionManager {
  constructor() {
    this.isConnected = true;
    this.checkInterval = null;
    this.listeners = new Set();
    this.retryCount = 0;
    this.MAX_RETRIES = 3;
    this.healthCheckEndpoint = 'projects'; // A lightweight table to check
  }

  // Subscribe to connection changes
  onConnectionChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(status) {
    if (this.isConnected !== status) {
        this.isConnected = status;
        this.listeners.forEach(listener => listener(status));
    }
  }

  // Main function to ensure connection
  async ensureConnected() {
    if (this.isConnected) return true;
    return await this.checkConnection();
  }

  // Perform a health check
  async checkConnection() {
    if (!supabase) return false;

    try {
      // Use a lightweight query (e.g., getting 1 row with no data)
      // Using 'count' is often lighter than fetching rows
      const { error } = await supabase
        .from(this.healthCheckEndpoint)
        .select('id', { count: 'exact', head: true })
        .timeout(5000);

      // PGRST116 is "no rows", which means connection is fine.
      // 401/403 means we connected but were denied, which is still "connected" to the server.
      if (error && 
          error.message !== 'Failed to fetch' && 
          !error.message?.includes('Network') &&
          error.status !== 503) {
         // We reached the server, even if it returned an error
         this.notifyListeners(true);
         return true;
      } else if (!error) {
         this.notifyListeners(true);
         return true;
      }

      throw error;

    } catch (error) {
      console.warn('[ConnectionManager] Health check failed:', error.message);
      this.notifyListeners(false);
      return false;
    }
  }

  // Start automatic monitoring
  startMonitoring(intervalMs = 30000) {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkConnection(); // Initial check
    this.checkInterval = setInterval(() => this.checkConnection(), intervalMs);
    
    // Also listen to window online/offline events
    window.addEventListener('online', () => this.checkConnection());
    window.addEventListener('offline', () => this.notifyListeners(false));
  }

  stopMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    window.removeEventListener('online', () => this.checkConnection());
    window.removeEventListener('offline', () => this.notifyListeners(false));
  }

  // Handle specific connection errors
  handleConnectionError(error) {
    const isNetworkError = 
      error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError') ||
      error.status === 503 ||
      error.status === 504;

    if (isNetworkError) {
      this.notifyListeners(false);
    }
    return isNetworkError;
  }
}

export const connectionManager = new SupabaseConnectionManager();