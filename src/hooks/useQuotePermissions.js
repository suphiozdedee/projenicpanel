import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useQuotePermissions() {
  const { user } = useAuth();
  const [accessibleQuoteIds, setAccessibleQuoteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch all quote IDs this user has explicit permission for
  const fetchUserPermissions = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    try {
      const { data, error } = await supabase
        .from('quote_permissions')
        .select('quote_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setAccessibleQuoteIds(new Set(data.map(p => p.quote_id)));
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasQuoteAccess = (project) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (project.created_by === user.id) return true;
    if (project.assigned_to === user.id) return true; 
    return accessibleQuoteIds.has(project.id);
  };

  const getQuoteAccessList = async (quoteId) => {
    const { data, error } = await supabase
      .from('quote_permissions')
      .select(`
        *,
        user:user_id (id, full_name, email, avatar_url)
      `)
      .eq('quote_id', quoteId);
    
    if (error) throw error;
    return data;
  };

  const grantAccess = async (quoteId, userId) => {
    const { error } = await supabase
      .from('quote_permissions')
      .insert({
        quote_id: quoteId,
        user_id: userId,
        granted_by: user.id
      });
    
    if (error) throw error;
  };

  const revokeAccess = async (permissionId) => {
    const { error } = await supabase
      .from('quote_permissions')
      .delete()
      .eq('id', permissionId);
    
    if (error) throw error;
  };

  return {
    loading,
    hasQuoteAccess,
    getQuoteAccessList,
    grantAccess,
    revokeAccess,
    refreshPermissions: fetchUserPermissions
  };
}