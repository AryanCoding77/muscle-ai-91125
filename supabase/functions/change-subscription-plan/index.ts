// Supabase Edge Function: Change Subscription Plan (Upgrade/Downgrade)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangePlanRequest {
  new_plan_id: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { new_plan_id, user_id }: ChangePlanRequest = await req.json();

    if (!new_plan_id || !user_id) {
      throw new Error('Missing required fields: new_plan_id and user_id');
    }

    console.log('🔄 Processing plan change:', { user_id, new_plan_id });

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', new_plan_id)
      .single();

    if (planError || !newPlan) {
      throw new Error('Invalid plan ID');
    }

    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      throw new Error('Invalid user ID');
    }

    // Get current active subscription
    const { data: currentSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();

    if (subError || !currentSubscription) {
      throw new Error('No active subscription found. Please create a new subscription instead.');
    }

    console.log('📋 Current subscription:', {
      subscription_id: currentSubscription.id,
      current_plan: currentSubscription.plan_id,
    });

    // Check if trying to change to the same plan
    if (currentSubscription.plan_id === new_plan_id) {
      throw new Error('You are already subscribed to this plan');
    }

    // Get or use existing Razorpay customer ID
    let razorpayCustomerId = currentSubscription.razorpay_customer_id;

    if (!razorpayCustomerId) {
      // Create Razorpay customer if doesn't exist
      const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
        },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          contact: user.user_metadata?.phone || '',
        }),
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json();
        
        // Try to fetch existing customer if already exists
        if (errorData.error?.description?.includes('already exists')) {
          const fetchResponse = await fetch(`https://api.razorpay.com/v1/customers?email=${user.email}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
            },
          });

          if (fetchResponse.ok) {
            const customers = await fetchResponse.json();
            if (customers.items && customers.items.length > 0) {
              razorpayCustomerId = customers.items[0].id;
            }
          }
        }
        
        if (!razorpayCustomerId) {
          throw new Error('Failed to get Razorpay customer');
        }
      } else {
        const customer = await customerResponse.json();
        razorpayCustomerId = customer.id;
      }
    }

    // Convert USD to INR (approximate rate: 1 USD = 83 INR)
    const amountInINR = Math.round(newPlan.plan_price_usd * 83);

    // Create payment link for the new plan
    const paymentLinkResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: amountInINR * 100, // Amount in paise
        currency: 'INR',
        description: `Plan Change: ${newPlan.plan_name} Plan - ${newPlan.monthly_analyses_limit} analyses/month`,
        customer: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          contact: user.user_metadata?.phone || '+919876543210',
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          user_id,
          plan_id: new_plan_id,
          plan_name: newPlan.plan_name,
          app: 'Muscle AI',
          is_plan_change: 'true',
          old_subscription_id: currentSubscription.id,
        },
        callback_url: `${SUPABASE_URL}/functions/v1/payment-callback`,
        callback_method: 'get',
      }),
    });

    if (!paymentLinkResponse.ok) {
      const error = await paymentLinkResponse.text();
      throw new Error(`Failed to create payment link: ${error}`);
    }

    const paymentLink = await paymentLinkResponse.json();

    // Cancel the current subscription immediately
    const { error: cancelError } = await supabase
      .from('user_subscriptions')
      .update({
        subscription_status: 'cancelled',
        auto_renewal_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSubscription.id);

    if (cancelError) {
      console.error('⚠️ Error cancelling old subscription:', cancelError);
      // Continue anyway - we'll handle this in payment callback
    }

    // Calculate billing cycle dates for new subscription
    const now = new Date();
    const cycleStart = now;
    const cycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create new subscription record (pending until payment)
    const { data: newSubscription, error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id,
        plan_id: new_plan_id,
        subscription_status: 'pending',
        razorpay_subscription_id: paymentLink.id,
        razorpay_customer_id: razorpayCustomerId,
        current_billing_cycle_start: cycleStart.toISOString(),
        current_billing_cycle_end: cycleEnd.toISOString(),
        analyses_used_this_month: 0,
        auto_renewal_enabled: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create new subscription record: ${insertError.message}`);
    }

    console.log('✅ Plan change initiated successfully:', {
      old_subscription_id: currentSubscription.id,
      new_subscription_id: newSubscription.id,
      payment_link_id: paymentLink.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: newSubscription.id,
        old_subscription_id: currentSubscription.id,
        payment_link_id: paymentLink.id,
        short_url: paymentLink.short_url,
        message: 'Plan change initiated. Please complete the payment to activate your new plan.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error changing subscription plan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
