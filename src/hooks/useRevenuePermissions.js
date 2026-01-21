
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useRevenuePermissions() {
  const { user, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRevenueAccess = useCallback(async () => {
    // Reset state when user is not present
    if (!user) {
        setHasAccess(false);
        setLoading(false);
        return false;
    }
    
    // Admins always have access
    if (isAdmin) {
      setHasAccess(true);
      setLoading(false);
      return true;
    }

    try {
      // FIX: Changed from .single() to standard select to handle 0 rows gracefully
      // This prevents the "PGRST116: The result contains 0 rows" error
      const { data, error } = await supabase
        .from('revenue_permissions')
        .select('id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // If data array has elements, user has permission
      const access = data && data.length > 0;
      setHasAccess(access);
      setLoading(false);
      return access;
    } catch (err) {
      console.error('Error checking revenue access:', err);
      // Default to false on error instead of crashing
      setHasAccess(false);
      setLoading(false);
      return false;
    }
  }, [user, isAdmin]);

  const grantRevenueAccess = async (userId) => {
    if (!isAdmin) throw new Error("Yetkisiz işlem: Sadece yöneticiler yetki verebilir.");
    
    // Check if already exists to avoid unique constraint error
    const { data } = await supabase
        .from('revenue_permissions')
        .select('id')
        .eq('user_id', userId);
        
    if (data && data.length > 0) return; // Already exists

    const { error } = await supabase
      .from('revenue_permissions')
      .insert({ user_id: userId, granted_by: user.id });
    
    if (error) throw error;
  };

  const revokeRevenueAccess = async (userId) => {
    if (!isAdmin) throw new Error("Yetkisiz işlem: Sadece yöneticiler yetki alabilir.");
    const { error } = await supabase
      .from('revenue_permissions')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  };

  const getPermittedUsers = async () => {
    if (!isAdmin) return [];
    const { data, error } = await supabase
      .from('revenue_permissions')
      .select('user_id');
    
    if (error) throw error;
    return data.map(p => p.user_id);
  };

  useEffect(() => {
    checkRevenueAccess();
  }, [checkRevenueAccess]);

  return {
    hasAccess,
    loading,
    checkRevenueAccess,
    grantRevenueAccess,
    revokeRevenueAccess,
    getPermittedUsers
  };
}
