
import { toast } from '@/components/ui/use-toast';

/**
 * Standardized Supabase Error Handler
 * Identifies error types and returns user-friendly messages.
 */
export const handleSupabaseError = (error, context = 'İşlem') => {
  if (!error) return null;

  // Log full error for debugging
  console.error(`[Supabase Error] in ${context}:`, error);

  let userMessage = 'Beklenmedik bir hata oluştu.';
  let type = 'unknown';

  // Network / Connection Errors
  if (
    error.message === 'Failed to fetch' || 
    error.message?.includes('Network request failed') ||
    error.message?.includes('connection') ||
    error.message === 'OFFLINE_ERROR' ||
    error.status === 0
  ) {
    type = 'network';
    userMessage = 'Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.';
  } 
  // Timeout
  else if (error.message === 'TIMEOUT_ERROR' || error.code === '504') {
    type = 'timeout';
    userMessage = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
  }
  // Permissions / Auth
  else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
    type = 'permission';
    userMessage = 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
  }
  else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    type = 'auth';
    userMessage = 'Oturumunuzun süresi dolmuş olabilir. Lütfen giriş yapın.';
  }
  // Data Validation
  else if (error.code === '23505') {
    type = 'duplicate';
    userMessage = 'Bu kayıt zaten mevcut.';
  }
  else if (error.code === '23503') {
    type = 'foreign_key';
    userMessage = 'İlişkili veri bulunamadığı için işlem yapılamadı.';
  }
  else if (error.code === 'PGRST116') {
    type = 'not_found';
    userMessage = 'Aranan veri bulunamadı.';
  }

  return {
    error,
    type,
    message: userMessage,
    context
  };
};

/**
 * Helper to display toast for handled errors
 */
export const showSupabaseErrorToast = (error, context = 'İşlem') => {
  const handled = handleSupabaseError(error, context);
  if (!handled) return;

  // Don't show toast for "not found" if it's often expected behavior in some contexts
  if (handled.type === 'not_found') return handled;
  
  toast({
    variant: "destructive",
    title: `${context} Başarısız`,
    description: handled.message
  });
  
  return handled;
};

/**
 * Wrapper for async operations with error handling
 */
export const withErrorHandling = async (
  operation, 
  setLoading, 
  context, 
  onSuccess, 
  options = {}
) => {
  const { 
    showSuccessToast = false, 
    successMessage = 'İşlem başarılı.',
    rethrow = false 
  } = options;

  if (setLoading) setLoading(true);

  try {
    const result = await operation();
    
    if (result?.error) throw result.error;

    if (onSuccess) await onSuccess(result.data);
    
    if (showSuccessToast) {
      toast({
        title: "Başarılı",
        description: successMessage,
        className: "bg-green-600 text-white border-none"
      });
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    showSupabaseErrorToast(error, context);
    if (rethrow) throw error;
    return { data: null, error };
  } finally {
    if (setLoading) setLoading(false);
  }
};
