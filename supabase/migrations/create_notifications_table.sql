-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
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

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notifications;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" ON public.notifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to check for expiring subscriptions and create notifications
CREATE OR REPLACE FUNCTION public.check_expiring_subscriptions()
RETURNS void AS $$
DECLARE
  v_subscription RECORD;
  v_days_until_expiry INTEGER;
  v_existing_notification UUID;
BEGIN
  -- Loop through all active subscriptions
  FOR v_subscription IN 
    SELECT 
      us.id,
      us.user_id,
      us.current_billing_cycle_end,
      sp.plan_name,
      us.razorpay_subscription_id
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.subscription_status = 'active'
      AND us.auto_renewal_enabled = false
      AND us.current_billing_cycle_end IS NOT NULL
  LOOP
    -- Calculate days until expiry
    v_days_until_expiry := EXTRACT(DAY FROM (v_subscription.current_billing_cycle_end - NOW()));
    
    -- If subscription expires in exactly 5 days
    IF v_days_until_expiry = 5 THEN
      -- Check if notification already exists for this subscription expiry
      SELECT id INTO v_existing_notification
      FROM public.notifications
      WHERE user_id = v_subscription.user_id
        AND type = 'subscription_expiry'
        AND metadata->>'subscription_id' = v_subscription.id::text
        AND created_at > NOW() - INTERVAL '7 days';
      
      -- Only create notification if it doesn't exist
      IF v_existing_notification IS NULL THEN
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          message,
          action_url,
          action_label,
          metadata
        ) VALUES (
          v_subscription.user_id,
          'subscription_expiry',
          'Subscription Expiring Soon',
          'Your ' || v_subscription.plan_name || ' plan will expire in 5 days. Renew now to continue enjoying premium features!',
          '/manage-subscription',
          'Renew Now',
          jsonb_build_object(
            'subscription_id', v_subscription.id,
            'plan_name', v_subscription.plan_name,
            'expiry_date', v_subscription.current_billing_cycle_end,
            'days_remaining', v_days_until_expiry
          )
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old read notifications (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE read = true
    AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true,
      read_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true,
      read_at = NOW()
  WHERE user_id = auth.uid()
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.notifications
  WHERE user_id = auth.uid()
    AND read = false;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
