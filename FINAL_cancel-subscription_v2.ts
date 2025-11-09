// Supabase Edge Function: Cancel Razorpay Subscription
// This function cancels auto-renewal but keeps access until billing cycle ends

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelSubscriptionRequest {
  subscription_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Parse request body
    const { subscription_id }: CancelSubscriptionRequest = await req.json();

    if (!subscription_id) {
      throw new Error('Missing subscription_id');
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');

    // Create client with anon key for user authentication
    const supabaseAuth = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    // Get current user by passing token explicitly
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      throw new Error('Unauthorized: ' + (userError?.message || 'Invalid token'));
    }

    console.log('✅ User authenticated:', user.id);

    // Create client with service role for database operations
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      console.error('❌ Subscription lookup error:', subError);
      throw new Error('Subscription not found. Please check your subscription ID.');
    }

    console.log('📋 Subscription status:', subscription.subscription_status);
    console.log('📅 Cycle end:', subscription.current_billing_cycle_end);

    // Check if already cancelled
    if (subscription.cancelled_at) {
      throw new Error('This subscription has already been cancelled.');
    }

    // Check subscription status
    if (subscription.subscription_status === 'expired') {
      throw new Error('This subscription has expired and cannot be cancelled.');
    }

    if (subscription.subscription_status !== 'active' && subscription.subscription_status !== 'pending') {
      throw new Error(`Cannot cancel subscription with status: ${subscription.subscription_status}`);
    }

    // Cancel subscription on Razorpay (only if it's a real subscription)
    if (subscription.razorpay_subscription_id) {
      const razorpayId = subscription.razorpay_subscription_id;
      
      // Check if this is a valid Razorpay subscription ID (starts with 'sub_')
      if (razorpayId.startsWith('sub_')) {
        console.log('🔄 Cancelling Razorpay subscription:', razorpayId);
        
        try {
          const cancelResponse = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${razorpayId}/cancel`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
              },
              body: JSON.stringify({
                cancel_at_cycle_end: 1, // Cancel at end of current billing cycle
              }),
            }
          );

          if (!cancelResponse.ok) {
            const errorText = await cancelResponse.text();
            console.error('❌ Razorpay cancel error:', {
              status: cancelResponse.status,
              statusText: cancelResponse.statusText,
              error: errorText,
            });
            
            // Try to parse error message
            let errorMessage = 'Failed to cancel subscription with Razorpay';
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error && errorJson.error.description) {
                errorMessage = `Razorpay error: ${errorJson.error.description}`;
              }
            } catch (e) {
              // Use default message if JSON parse fails
            }
            
            throw new Error(errorMessage);
          }
          
          const responseData = await cancelResponse.json();
          console.log('✅ Razorpay cancellation successful:', responseData);
        } catch (error) {
          console.error('❌ Error calling Razorpay API:', error);
          throw new Error(
            error instanceof Error 
              ? error.message 
              : 'Failed to cancel subscription with Razorpay'
          );
        }
      } else {
        // Not a subscription ID (might be payment link or payment ID)
        console.log('⚠️ Razorpay ID is not a subscription (ID: ' + razorpayId + ')');
        console.log('ℹ️ Skipping Razorpay cancellation - subscription created via payment link or one-time payment');
      }
    } else {
      console.log('⚠️ No Razorpay subscription ID found, skipping Razorpay cancellation');
    }

    // ✅ IMPORTANT: Keep status as 'active' so user retains access until cycle_end
    // Just disable auto-renewal and mark cancellation date
    console.log('💾 Updating subscription - disabling auto-renewal...');
    
    const { data: updatedData, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        auto_renewal_enabled: false,       // Disable auto-renewal
        cancelled_at: new Date().toISOString(),  // Mark when cancelled
        updated_at: new Date().toISOString(),
        // NOTE: We keep subscription_status = 'active' so user keeps access until cycle_end
      })
      .eq('id', subscription_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    console.log('✅ Subscription cancelled successfully (access until cycle end):', {
      id: subscription_id,
      status: updatedData?.subscription_status,
      cancelled_at: updatedData?.cancelled_at,
      access_until: subscription.current_billing_cycle_end,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully. You will have access until the end of your billing cycle.',
        subscription: {
          id: subscription_id,
          status: 'active',  // Still active until cycle ends
          cancelled: true,
          access_until: subscription.current_billing_cycle_end,
          auto_renewal: false,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
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
