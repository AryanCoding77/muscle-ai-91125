# Notification System for Subscription Expiry

## Overview
This document describes the notification system implemented for MuscleAI to alert users when their subscription plan will expire in 5 days.

## Features
- **Subscription Expiry Notifications**: Automatically notifies users 5 days before their subscription expires
- **Real-time Updates**: Notifications are fetched in real-time and displayed in the notification page
- **Multiple Notification Types**: Supports various notification types including:
  - `subscription_expiry` - When subscription is about to expire
  - `reminder` - General reminders
  - `achievement` - Achievement badges and milestones
  - `subscription_cancelled` - When subscription is cancelled
  - `payment_failed` - When payment fails
  - `system` - System announcements

## Database Schema

### Notifications Table
The `notifications` table stores all user notifications with the following structure:

```sql
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'subscription_expiry', 'subscription_cancelled', 'payment_failed', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);
```

### Database Functions

#### `check_expiring_subscriptions()`
Automatically checks for subscriptions that will expire in 5 days and creates notifications. This function:
- Loops through all active subscriptions with auto-renewal disabled
- Calculates days until expiry
- Creates a notification when exactly 5 days remain
- Prevents duplicate notifications within a 7-day window

#### `mark_notification_read(notification_id UUID)`
Marks a specific notification as read and sets the `read_at` timestamp.

#### `mark_all_notifications_read()`
Marks all notifications for the current user as read.

#### `get_unread_notification_count()`
Returns the count of unread notifications for the current user.

#### `cleanup_old_notifications()`
Removes read notifications older than 30 days to keep the database clean.

## Implementation Details

### 1. Database Migration
Run the migration file to set up the notifications table and functions:
```bash
# Navigate to Supabase dashboard > SQL Editor
# Run: supabase/migrations/create_notifications_table.sql
```

### 2. Notification Service
Located at: `src/services/notificationService.ts`

Key functions:
- `getUserNotifications()` - Fetch all notifications for current user
- `getUnreadNotificationCount()` - Get count of unread notifications
- `markNotificationAsRead(notificationId)` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all notifications as read
- `checkExpiringSubscriptions()` - Check and create expiry notifications
- `createNotification()` - Create custom notifications

### 3. Notification Context
Located at: `src/context/NotificationContext.tsx`

Provides:
- Real-time notification count in app header
- Global notification state management
- Automatic refresh on database changes
- Checks for expiring subscriptions on load

### 4. Notification Screen
Located at: `src/screens/NotificationScreen.tsx`

Features:
- Displays all notifications with proper styling
- Pull-to-refresh functionality
- Mark notifications as read on tap
- Navigate to relevant screens via action buttons
- Visual indicators for unread notifications
- Color-coded notification types
- Relative timestamps (e.g., "2 hours ago", "5 days ago")

## How It Works

### Automatic Expiry Notifications
1. User has an active subscription with `auto_renewal_enabled = false`
2. The `check_expiring_subscriptions()` function runs (called on app load or via cron)
3. Function calculates days until expiry: `EXTRACT(DAY FROM (cycle_end - NOW()))`
4. If exactly 5 days remain, creates a notification with:
   - Title: "Subscription Expiring Soon"
   - Message: "Your [Plan Name] plan will expire in 5 days. Renew now to continue enjoying premium features!"
   - Action button: "Renew Now" (navigates to ManageSubscription)
   - Metadata: Includes subscription details

### Notification Flow
1. Notification is created in database
2. NotificationContext automatically detects the new notification (real-time subscription)
3. Notification count badge updates in header
4. User navigates to NotificationScreen
5. Notification appears with visual indicator (unread dot + highlight)
6. User taps notification → marked as read → navigates to subscription page

## Setting Up Automatic Checks

### Option 1: Supabase Cron Job (Recommended)
Set up a pg_cron job to run daily:

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'check-expiring-subscriptions',
  '0 10 * * *', -- Run daily at 10 AM
  $$SELECT check_expiring_subscriptions();$$
);
```

### Option 2: App-based Checking
The `checkExpiringSubscriptions()` function is already called in `NotificationContext` whenever the app loads, providing automatic checks without additional infrastructure.

## Testing the System

### Manual Testing
1. Create a test subscription that expires in 5 days:
```sql
-- In Supabase SQL Editor
INSERT INTO user_subscriptions (
  user_id, 
  plan_id, 
  subscription_status, 
  current_billing_cycle_start, 
  current_billing_cycle_end,
  auto_renewal_enabled
) VALUES (
  '[YOUR_USER_ID]',
  (SELECT id FROM subscription_plans WHERE plan_name = 'Basic' LIMIT 1),
  'active',
  NOW(),
  NOW() + INTERVAL '5 days',
  false
);

-- Manually trigger notification check
SELECT check_expiring_subscriptions();
```

2. Refresh the app to see the notification appear

### Verify Notification
```sql
-- Check if notification was created
SELECT * FROM notifications 
WHERE user_id = '[YOUR_USER_ID]' 
  AND type = 'subscription_expiry'
ORDER BY created_at DESC;
```

## Customization

### Change Notification Timing
To notify at a different time (e.g., 3 days instead of 5):

Edit `supabase/migrations/create_notifications_table.sql`:
```sql
-- Change this line:
IF v_days_until_expiry = 5 THEN
-- To:
IF v_days_until_expiry = 3 THEN
```

### Add Multiple Notifications
To send notifications at multiple intervals (e.g., 7 days, 3 days, 1 day):
```sql
IF v_days_until_expiry IN (7, 3, 1) THEN
  -- Check for existing notification for this specific day
  SELECT id INTO v_existing_notification
  FROM public.notifications
  WHERE user_id = v_subscription.user_id
    AND type = 'subscription_expiry'
    AND metadata->>'subscription_id' = v_subscription.id::text
    AND metadata->>'days_remaining' = v_days_until_expiry::text
    AND created_at > NOW() - INTERVAL '2 days';
  
  IF v_existing_notification IS NULL THEN
    -- Create notification
  END IF;
END IF;
```

## File Structure
```
src/
├── services/
│   └── notificationService.ts          # Notification API service
├── context/
│   └── NotificationContext.tsx         # Global notification state
├── screens/
│   └── NotificationScreen.tsx          # Notification UI
supabase/
└── migrations/
    └── create_notifications_table.sql  # Database schema
```

## Security
- Row Level Security (RLS) enabled on notifications table
- Users can only view their own notifications
- Service role can manage all notifications (for admin functions)
- Notifications are automatically filtered by user_id

## Future Enhancements
- Push notifications (using Expo Notifications)
- Email notifications for critical alerts
- In-app notification preferences
- Notification categories/filtering
- Batch notification operations
- Notification history archiving
