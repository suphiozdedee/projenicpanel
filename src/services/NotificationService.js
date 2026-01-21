import { supabase } from '@/lib/customSupabaseClient';
import { safeQuery } from '@/lib/networkUtils';

export const NotificationService = {
  /**
   * Create a new notification for a user with error handling
   * @param {string} userId - The ID of the user to notify (recipient)
   * @param {string} type - The type of notification
   * @param {string} message - The notification message
   * @param {string} projectId - Optional related project ID
   */
  async createNotification(userId, type, message, projectId = null) {
    if (!userId) return;
    
    try {
      // Fire and forget - don't block for notifications, but catch errors
      const promise = supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          message,
          related_project_id: projectId,
          read: false
        });
      
      // We don't await strictly to keep UI snappy, but we catch potential rejection
      promise.then(({ error }) => {
          if (error) console.warn('Notification insert failed:', error.message);
      }).catch(err => {
          console.warn('Notification network error:', err);
      });

    } catch (error) {
      console.error('NotificationService internal error:', error);
    }
  },

  /**
   * Handle status change notifications specifically for Designers -> Brand Reps
   */
  async notifyStatusChange(projectId, newStatus, designerName, projectName) {
    try {
      // Safe fetch of project details
      const { data: project, error: projectError } = await safeQuery(
        () => supabase
            .from('projects')
            .select('created_by')
            .eq('id', projectId)
            .single(),
        { retries: 1, errorMessage: 'Failed to fetch project for notification' }
      );

      if (projectError || !project || !project.created_by) {
        return; // Silent fail if we can't find who to notify
      }

      // 2. Define messages based on status
      let message = `Proje durumu güncellendi: ${newStatus}`;
      const statusMessages = {
        'Tasarım çizildi': `Tasarım çizildi - ${projectName}`,
        'Proje yüklendi': `Proje yüklendi - ${projectName}`,
        'Tasarım bitti': `Tasarım bitti - ${projectName}`,
        'Revize': `Revize talep edildi - ${projectName}`,
        'Teklif Bekliyor': `Teklif bekleniyor - ${projectName}`,
        'Teklif Verildi': `Teklif verildi - ${projectName}`,
        'Onaylandı': `Teklif onaylandı - ${projectName}`,
        'Reddedildi': `Teklif reddedildi - ${projectName}`,
        'Tasarıma Başlandı': `Tasarıma başlandı - ${projectName}`,
        'started': `Üretime/Projeye başlandı - ${projectName}`,
        'completed': `Proje tamamlandı - ${projectName}`
      };

      if (statusMessages[newStatus]) {
          message = statusMessages[newStatus];
      }

      await this.createNotification(
        project.created_by,
        'status_update',
        message,
        projectId
      );

    } catch (error) {
      // Log but don't crash app for notification failure
      console.warn('Error in notifyStatusChange:', error);
    }
  },

  /**
   * Fetch unread notifications for a user with safe query
   */
  async getNotifications(userId) {
    if (!userId) return [];
    
    try {
      const { data, error } = await safeQuery(
        () => supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('read', false)
            .order('created_at', { ascending: false })
            .limit(20),
        { retries: 1 }
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Error fetching notifications:', error);
      return []; // Return empty array on failure so UI doesn't break
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    if (!notificationId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.warn('Error marking notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    if (!userId) return;

    try {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
    } catch (error) {
        console.warn('Error marking all notifications as read:', error);
    }
  }
};