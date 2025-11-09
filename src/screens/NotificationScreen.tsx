import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { getUserNotifications, Notification } from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';

export const NotificationScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { markAsRead, refreshNotificationCount } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      await refreshNotificationCount();
    }

    // Handle navigation if action_url is present
    if (notification.action_url) {
      // Navigate based on action_url
      if (notification.action_url === '/manage-subscription') {
        navigation.navigate('ManageSubscription');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'subscription_expiry':
        return 'time-outline';
      case 'reminder':
        return 'notifications';
      case 'achievement':
        return 'trophy';
      case 'subscription_cancelled':
        return 'close-circle';
      case 'payment_failed':
        return 'card-outline';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'subscription_expiry':
        return '#FF9F0A';
      case 'reminder':
        return '#5E5CE6';
      case 'achievement':
        return '#30D158';
      case 'subscription_cancelled':
        return '#FF453A';
      case 'payment_failed':
        return '#FF453A';
      default:
        return '#5E5CE6';
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            View all
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{notifications.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'verified' && styles.tabActive]}
          onPress={() => setActiveTab('verified')}
        >
          <Text style={[styles.tabText, activeTab === 'verified' && styles.tabTextActive]}>
            Verified
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'mentions' && styles.tabActive]}
          onPress={() => setActiveTab('mentions')}
        >
          <Text style={[styles.tabText, activeTab === 'mentions' && styles.tabTextActive]}>
            Mentions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.notificationsList} 
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll notify you about important updates</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.notificationItemUnread
              ]}
              activeOpacity={0.7}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.avatarContainer}>
                <View style={[
                  styles.avatar,
                  { backgroundColor: getNotificationColor(notification.type) }
                ]}>
                  <Ionicons 
                    name={getNotificationIcon(notification.type) as any} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationTop}>
                  <View style={styles.notificationLeft}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                  </View>
                  <View style={styles.notificationRight}>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                </View>

                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{notification.message}</Text>
                </View>

                {notification.action_label && notification.action_url && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <Text style={styles.actionButtonText}>{notification.action_label}</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginTop: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#5E5CE6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  notificationsContent: {
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: '#0A0A0C',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationLeft: {
    flex: 1,
    marginRight: 12,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  userName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  actionText: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  targetText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  notificationRight: {
    alignItems: 'flex-end',
  },
  timeAgo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5E5CE6',
  },
  messageBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#5E5CE6',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  notificationItemUnread: {
    backgroundColor: 'rgba(94, 92, 230, 0.05)',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
