-- Fix for Cancelled Subscriptions
-- This ensures users keep access until billing cycle ends

-- 1. Update get_user_subscription_details to show cancelled status
CREATE OR REPLACE FUNCTION public.get_user_subscription_details()
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  plan_price DECIMAL,
  subscription_status TEXT,
  analyses_used INTEGER,
  analyses_limit INTEGER,
  analyses_remaining INTEGER,
  cycle_start TIMESTAMP WITH TIME ZONE,
  cycle_end TIMESTAMP WITH TIME ZONE,
  auto_renewal BOOLEAN,
  razorpay_subscription_id TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    us.id,
    sp.plan_name,
    sp.plan_price_usd,
    -- Show 'cancelled' if cancelled_at is set, otherwise show actual status
    CASE 
      WHEN us.cancelled_at IS NOT NULL AND us.current_billing_cycle_end > NOW() THEN 'cancelled'
      ELSE us.subscription_status
    END::TEXT,
    us.analyses_used_this_month,
    sp.monthly_analyses_limit,
    sp.monthly_analyses_limit - us.analyses_used_this_month,
    us.current_billing_cycle_start,
    us.current_billing_cycle_end,
    us.auto_renewal_enabled,
    us.razorpay_subscription_id
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = v_user_id
    AND us.subscription_status = 'active'  -- Keep as active until cycle ends
    AND us.current_billing_cycle_end > NOW()  -- Still has access
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to expire subscriptions after billing cycle ends
CREATE OR REPLACE FUNCTION public.expire_ended_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscriptions that have passed their cycle_end date
  UPDATE public.user_subscriptions
  SET 
    subscription_status = 'expired',
    updated_at = NOW()
  WHERE subscription_status = 'active'
    AND cancelled_at IS NOT NULL  -- Was cancelled
    AND current_billing_cycle_end < NOW()  -- Cycle has ended
    AND current_billing_cycle_end > NOW() - INTERVAL '7 days';  -- Only process recent ones
  
  -- Log the update
  RAISE NOTICE 'Expired % subscriptions that passed their billing cycle end', ROW_COUNT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to check if subscription is cancelled but still has access
CREATE OR REPLACE FUNCTION public.is_subscription_cancelled_with_access(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM public.user_subscriptions
  WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Returns true if cancelled but still has access
  RETURN (
    v_subscription.cancelled_at IS NOT NULL 
    AND v_subscription.subscription_status = 'active'
    AND v_subscription.current_billing_cycle_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. OPTIONAL: If you want to run the expiration function on a schedule
-- You can set up a cron job in Supabase Dashboard:
-- Schedule: Run daily at midnight
-- Command: SELECT public.expire_ended_subscriptions();

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Deploy the updated edge function (FINAL_cancel-subscription_v2.ts)
-- 3. Set up a daily cron job to run expire_ended_subscriptions()
--    Go to: Database > Extensions > pg_cron
--    Or use Supabase Edge Functions with a scheduled function

-- Test the function:
-- SELECT public.expire_ended_subscriptions();

COMMENT ON FUNCTION public.get_user_subscription_details() IS 
'Returns subscription details. Shows status as cancelled if cancellation is scheduled but access remains until cycle_end';

COMMENT ON FUNCTION public.expire_ended_subscriptions() IS 
'Expires subscriptions that have passed their billing cycle end date. Run this daily via cron job.';

COMMENT ON FUNCTION public.is_subscription_cancelled_with_access(UUID) IS 
'Checks if a subscription is cancelled but user still has access until cycle end';
