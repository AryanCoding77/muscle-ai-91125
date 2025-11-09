import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  checkExpiringSubscriptions,
} from '../services/notificationService';

interface NotificationContextType {
  notificationCount: number;
  refreshNotificationCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();

  const fetchNotificationCount = async () => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    try {
      // Fetch unread notification count from database
      const unreadCount = await getUnreadNotificationCount();
      setNotificationCount(unreadCount);
      
      // Also check for expiring subscriptions when fetching notifications
      await checkExpiringSubscriptions();
    } catch (error) {
      console.error('Error in fetchNotificationCount:', error);
      setNotificationCount(0);
    }
  };

  const refreshNotificationCount = async () => {
    await fetchNotificationCount();
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        await refreshNotificationCount();
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        await refreshNotificationCount();
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  // Fetch notification count on mount and when user changes
  useEffect(() => {
    fetchNotificationCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        refreshNotificationCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
