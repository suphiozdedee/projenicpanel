import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { NotificationService } from '@/services/NotificationService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchNotifications = async () => {
      setLoading(true);
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data || []);
      setUnreadCount(data?.length || 0);
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAsRead = async (id) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
      if (!user) return;
      await NotificationService.markAllAsRead(user.id);
      setNotifications([]);
      setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}