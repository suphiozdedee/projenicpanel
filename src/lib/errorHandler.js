
import { toast } from '@/components/ui/use-toast';
import { handleSupabaseError } from '@/lib/supabaseErrorHandler';

/**
 * Wrapper function to handle async operations with comprehensive error handling and loading states.
 * 
 * @param {Function} operation - The async function to execute
 * @param {Function} setLoading - State setter for loading status (optional)
 * @param {string} errorContext - Description of the operation for error messages
 * @param {Function} onSuccess - Callback function to run on success (optional)
 * @param {Object} options - Additional options
 */
export const withErrorHandling = async (
  operation,
  setLoading = null,
  errorContext = 'İşlem',
  onSuccess = null,
  options = {}
) => {
  const {
    showSuccessToast = false,
    successMessage = 'İşlem başarıyla tamamlandı.',
    rethrow = false
  } = options;

  try {
    if (setLoading) setLoading(true);
    
    const result = await operation();

    // Check if result is a Supabase response object with an error
    if (result && result.error) {
      throw result.error;
    }

    if (showSuccessToast) {
      toast({
        title: "Başarılı",
        description: successMessage,
        className: "bg-green-600 text-white border-none"
      });
    }

    if (onSuccess) {
      await onSuccess(result?.data || result);
    }

    return { success: true, data: result?.data || result };

  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    
    // Use the existing specialized Supabase error handler
    const handled = handleSupabaseError(error, errorContext);
    
    toast({
      variant: "destructive",
      title: `${errorContext} Başarısız`,
      description: handled?.message || error.message || "Bilinmeyen bir hata oluştu."
    });

    if (rethrow) throw error;
    return { success: false, error };

  } finally {
    if (setLoading) setLoading(false);
  }
};
