// Notification service for handling all notification-related operations

import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'reminder' | 'achievement' | 'subscription_expiry' | 'subscription_cancelled' | 'payment_failed' | 'system';
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  read: boolean;
  created_at: string;
  read_at?: string;
}

/**
 * Fetch all notifications for the current user
 */
export const getUserNotifications = async (limit: number = 50): Promise<Notification[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user for notifications');
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Exception in getUserNotifications:', error);
    return [];
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count');

    if (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('❌ Exception in getUnreadNotificationCount:', error);
    return 0;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('mark_notification_read', {
      notification_id: notificationId,
    });

    if (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Exception in markNotificationAsRead:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('mark_all_notifications_read');

    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Exception in markAllNotificationsAsRead:', error);
    return false;
  }
};

/**
 * Check for expiring subscriptions and create notifications
 * This should be called periodically (e.g., daily via cron job or on app load)
 */
export const checkExpiringSubscriptions = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('check_expiring_subscriptions');

    if (error) {
      console.error('❌ Error checking expiring subscriptions:', error);
    }
  } catch (error) {
    console.error('❌ Exception in checkExpiringSubscriptions:', error);
  }
};

/**
 * Create a custom notification
 */
export const createNotification = async (
  type: Notification['type'],
  title: string,
  message: string,
  options?: {
    action_url?: string;
    action_label?: string;
    metadata?: Record<string, any>;
  }
): Promise<Notification | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user for creating notification');
      return null;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type,
        title,
        message,
        action_url: options?.action_url,
        action_label: options?.action_label,
        metadata: options?.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception in createNotification:', error);
    return null;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user for deleting notification');
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error deleting notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Exception in deleteNotification:', error);
    return false;
  }
};
