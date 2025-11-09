# Quick Setup Guide: Subscription Expiry Notifications

## ✅ What's Been Implemented

Your app now has a complete notification system that:
- **Automatically notifies users 5 days before their subscription expires**
- Displays notifications in the notification page
- Shows unread notification count in the app header
- Allows users to tap notifications to navigate to subscription management
- Supports real-time notification updates

## 🚀 Deployment Steps

### Step 1: Deploy Database Changes
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of:
   ```
   supabase/migrations/create_notifications_table.sql
   ```
4. Click **Run** to execute the SQL

### Step 2: Verify Installation
Run this query in Supabase SQL Editor to verify:
```sql
-- Check if notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%notification%';
```

### Step 3: (Optional) Set Up Daily Cron Job
To automatically check for expiring subscriptions every day at 10 AM:

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'check-expiring-subscriptions',
  '0 10 * * *', -- 10 AM daily
  $$SELECT check_expiring_subscriptions();$$
);
```

**Note:** Without a cron job, notifications will still be checked whenever a user opens the app.

## 📱 How It Works

### For Users
1. User has an active subscription with auto-renewal disabled
2. 5 days before expiry, a notification appears automatically
3. User opens the notification page and sees:
   - 🕒 **Icon** indicating expiry notification
   - **Title**: "Subscription Expiring Soon"
   - **Message**: Details about which plan is expiring
   - **Action Button**: "Renew Now" (navigates to subscription page)
4. User can tap the notification to mark it as read and navigate to renew

### For Developers
- **Database Function**: `check_expiring_subscriptions()` runs automatically
- **Service Layer**: `notificationService.ts` handles all notification operations
- **Context**: `NotificationContext.tsx` manages global notification state
- **UI**: `NotificationScreen.tsx` displays notifications with proper styling

## 🧪 Testing

### Create a Test Notification
Run this in Supabase SQL Editor:

```sql
-- Step 1: Get your user ID
SELECT id, email FROM auth.users;

-- Step 2: Create a test subscription expiring in 5 days
INSERT INTO user_subscriptions (
  user_id, 
  plan_id, 
  subscription_status, 
  current_billing_cycle_start, 
  current_billing_cycle_end,
  auto_renewal_enabled
) VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM subscription_plans WHERE plan_name = 'Basic' LIMIT 1),
  'active',
  NOW(),
  NOW() + INTERVAL '5 days',
  false
);

-- Step 3: Trigger notification check
SELECT check_expiring_subscriptions();

-- Step 4: Verify notification was created
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID_HERE' 
ORDER BY created_at DESC;
```

### Test in the App
1. Restart your app
2. Check the notification badge in the header (should show "1")
3. Navigate to the Notification screen
4. See your expiry notification with orange clock icon
5. Tap it to mark as read and navigate to subscription page

## 🎨 Notification Types & Colors

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| subscription_expiry | 🕒 | Orange | Plan expiring soon |
| reminder | 🔔 | Purple | General reminders |
| achievement | 🏆 | Green | Badges & milestones |
| subscription_cancelled | ❌ | Red | Subscription cancelled |
| payment_failed | 💳 | Red | Payment issues |
| system | ℹ️ | Purple | System announcements |

## 🔧 Customization

### Change Notification Timing
Edit the SQL function in `create_notifications_table.sql`:

```sql
-- Current: 5 days before expiry
IF v_days_until_expiry = 5 THEN

-- Change to 3 days:
IF v_days_until_expiry = 3 THEN
```

### Send Multiple Notifications
```sql
-- Notify at 7 days, 3 days, and 1 day
IF v_days_until_expiry IN (7, 3, 1) THEN
```

### Create Custom Notifications
Use the notification service in your code:

```typescript
import { createNotification } from '../services/notificationService';

await createNotification(
  'reminder',
  'Custom Title',
  'Custom message here',
  {
    action_url: '/some-screen',
    action_label: 'Take Action',
    metadata: { custom_data: 'value' }
  }
);
```

## 📁 Files Modified/Created

### New Files
- ✅ `supabase/migrations/create_notifications_table.sql` - Database schema
- ✅ `src/services/notificationService.ts` - Notification API
- ✅ `NOTIFICATION_SYSTEM.md` - Detailed documentation
- ✅ `NOTIFICATION_SETUP_GUIDE.md` - This file

### Modified Files
- ✅ `src/context/NotificationContext.tsx` - Now uses real notifications
- ✅ `src/screens/NotificationScreen.tsx` - Displays real notifications from database

## 🆘 Troubleshooting

### Notifications Not Appearing
1. **Check database**: Run `SELECT * FROM notifications WHERE user_id = 'YOUR_ID'`
2. **Check subscription**: Verify subscription expires in exactly 5 days
3. **Check auto-renewal**: Ensure `auto_renewal_enabled = false`
4. **Trigger manually**: Run `SELECT check_expiring_subscriptions();`

### Notification Count Not Updating
1. Refresh the app (pull down on any screen)
2. Check Supabase real-time is enabled for the notifications table
3. Verify RLS policies are set correctly

### Test Notification Not Created
1. Ensure you replaced `'YOUR_USER_ID_HERE'` with actual UUID
2. Check that plan_id exists: `SELECT * FROM subscription_plans;`
3. Verify interval is exactly 5 days: `SELECT NOW() + INTERVAL '5 days';`

## 📊 Monitoring

### View All Notifications
```sql
SELECT 
  n.id,
  n.type,
  n.title,
  n.read,
  n.created_at,
  u.email as user_email
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 50;
```

### Check Expiring Subscriptions
```sql
SELECT 
  us.id,
  u.email,
  sp.plan_name,
  us.current_billing_cycle_end,
  EXTRACT(DAY FROM (us.current_billing_cycle_end - NOW())) as days_remaining
FROM user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.subscription_status = 'active'
  AND us.auto_renewal_enabled = false
  AND us.current_billing_cycle_end > NOW()
ORDER BY us.current_billing_cycle_end ASC;
```

## ✨ Next Steps

Consider adding:
1. **Push Notifications**: Use Expo Notifications for push alerts
2. **Email Notifications**: Send email reminders via Supabase Edge Functions
3. **User Preferences**: Let users choose notification frequency
4. **Notification History**: Archive old notifications
5. **Analytics**: Track notification engagement rates

## 🎉 You're All Set!

The notification system is now ready to use. Once you deploy the database changes, the app will automatically:
- Check for expiring subscriptions on app load
- Create notifications 5 days before expiry
- Display them in the notification page
- Allow users to take action (renew subscription)

For detailed technical documentation, see `NOTIFICATION_SYSTEM.md`.
