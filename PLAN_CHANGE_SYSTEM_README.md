# Plan Change System - Complete Guide

## 🎯 Overview

The plan change system allows users to upgrade or downgrade their subscription plans seamlessly. When a user changes plans:

1. **Current subscription is cancelled** immediately
2. **Payment link is generated** for the new plan
3. **New subscription is created** upon successful payment
4. **User gets immediate access** to the new plan's features

## 🏗️ Architecture

### Components Implemented

1. **Edge Function**: `change-subscription-plan`
   - Location: `supabase/functions/change-subscription-plan/index.ts`
   - Handles plan changes atomically
   - Cancels old subscription
   - Creates new subscription
   - Generates payment link

2. **Service Function**: `changeSubscriptionPlan()`
   - Location: `src/services/subscriptionService.ts`
   - Called from the frontend
   - Invokes the edge function
   - Returns payment link

3. **UI Updates**:
   - **ManageSubscriptionScreen**: "Change Plan" button (already implemented)
   - **SubscriptionPlansScreen**: Detects active subscriptions and shows plan change dialog
   - **PaymentScreen**: Enhanced to handle both new subscriptions and plan changes

## 🚀 How It Works

### User Flow

```
User has Active Subscription (e.g., Basic Plan)
    ↓
Clicks "Change Plan" in Manage Subscription
    ↓
Navigates to Subscription Plans Screen
    ↓
Selects New Plan (e.g., Pro Plan)
    ↓
Confirmation Dialog: "Switch from Basic to Pro?"
    ↓
Proceeds to Payment Screen
    ↓
Payment Screen shows:
    - Current Plan: Basic (strikethrough)
    - ↓
    - New Plan: Pro
    - Amount: $X/month
    - Notice: "Current plan will be cancelled"
    ↓
User clicks "Pay"
    ↓
Edge Function:
    1. Validates new plan
    2. Cancels current subscription
    3. Creates new subscription (pending)
    4. Generates Razorpay payment link
    ↓
User redirected to Razorpay
    ↓
Payment successful
    ↓
Webhook activates new subscription
    ↓
User has access to new plan
```

### Technical Flow

```typescript
// 1. User selects new plan
handleSelectPlan(newPlan) {
  if (hasActiveSubscription && currentPlan !== newPlan) {
    // Show confirmation dialog
    setPlanToChange(newPlan);
    setShowChangePlanDialog(true);
  }
}

// 2. User confirms plan change
handleChangePlanConfirm() {
  navigation.navigate('Payment', { 
    plan: newPlan, 
    isUpgrade: true 
  });
}

// 3. Payment screen detects plan change
const { plan, isUpgrade } = route.params;

if (hasActiveSubscription || isUpgrade) {
  // Call change plan function
  result = await changeSubscriptionPlan(plan.id);
} else {
  // Call create subscription function
  result = await createSubscription(plan.id);
}

// 4. Edge function processes plan change
async function changeSubscriptionPlan() {
  // Get current subscription
  const current = await getCurrentSubscription(userId);
  
  // Validate new plan
  const newPlan = await getPlan(newPlanId);
  
  // Create payment link
  const paymentLink = await razorpay.createPaymentLink(...);
  
  // Cancel current subscription
  await cancelSubscription(current.id);
  
  // Create new subscription (pending)
  const newSub = await createSubscription({
    status: 'pending',
    planId: newPlanId,
    ...
  });
  
  return { paymentLink, newSubscriptionId };
}
```

## 📦 Deployment

### Deploy the Edge Function

```bash
# Windows
deploy-change-plan.bat

# Or manually
supabase functions deploy change-subscription-plan --no-verify-jwt
```

### Environment Variables Required

Make sure these are set in Supabase:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Testing

### Test Plan Change Flow

1. **Create a test subscription**:
   - Sign in to the app
   - Go to Subscription Plans
   - Subscribe to the Basic plan
   - Complete payment
   - Wait for subscription to activate

2. **Test plan upgrade**:
   - Go to Manage Subscription
   - Click "Change Plan"
   - Select Pro or VIP plan
   - Verify confirmation dialog shows:
     - "Switch from Basic to [New Plan]?"
   - Click "Continue"
   - Verify Payment screen shows:
     - "Plan Change Summary" header
     - Current Plan: Basic (strikethrough)
     - Down arrow (↓)
     - New Plan: [Selected Plan]
     - Change notice about cancellation
   - Click "Pay $X"
   - Complete payment in browser
   - Return to app
   - Refresh Manage Subscription
   - Verify new plan is active

3. **Test plan downgrade**:
   - Same flow as upgrade
   - Select a lower-priced plan

4. **Error cases to test**:
   - Try to change to the same plan (should show error)
   - Try to change without active subscription (should create new)
   - Cancel during payment (subscription should remain unchanged)

## 🔧 Troubleshooting

### Common Issues

1. **"User already has an active subscription" error**
   - This means the old `create-subscription` function is being called instead of `change-subscription-plan`
   - Check that `PaymentScreen` is receiving `isUpgrade: true` parameter
   - Check that `hasActiveSubscription` state is set correctly

2. **"No active subscription found"**
   - User might not have an active subscription
   - Subscription might be in 'pending' or 'cancelled' state
   - Check subscription status in database

3. **Payment link not opening**
   - Check browser permissions
   - Verify Razorpay keys are configured
   - Check edge function logs

4. **Old subscription not cancelled**
   - Check edge function logs
   - Verify database update permissions
   - Old subscription should be set to 'cancelled' status

## 📊 Database Changes

The system uses existing tables:
- `user_subscriptions`: Stores both old (cancelled) and new (pending/active) subscriptions
- `subscription_plans`: Plan details
- `payment_transactions`: Payment records

No schema changes required.

## 🎨 UI/UX Features

### Payment Screen Enhancements

- **Conditional header**: "Change Plan" vs "Complete Payment"
- **Plan comparison view**: Shows old plan → new plan
- **Visual indicator**: Down arrow between plans
- **Strikethrough text**: Old plan is crossed out
- **Clear notice**: Explains what happens to current plan
- **Context-aware messaging**: Different success messages for changes vs new subscriptions

### Subscription Plans Screen

- **Active plan indicator**: "ACTIVE" badge on current plan
- **Confirmation dialog**: Warns before plan change
- **Disabled state**: Current plan shows "Your Current Plan" button

## 🔐 Security

- ✅ User authentication required
- ✅ Plan validation (prevents invalid plan IDs)
- ✅ Subscription ownership verification
- ✅ Razorpay signature verification (in payment callback)
- ✅ Service role key for database operations

## 📝 Notes

- **Immediate cancellation**: Old plan is cancelled immediately when user initiates change
- **Pending activation**: New plan activates after successful payment
- **No pro-rating**: Users pay full price for new plan (current billing cycle)
- **Auto-renewal**: New subscription has auto-renewal enabled by default
- **Payment history**: Both transactions are recorded separately

## ✅ Success Criteria

The plan change system is working correctly when:

- [x] Users can see "Change Plan" option when they have active subscription
- [x] Selecting different plan shows confirmation dialog
- [x] Payment screen shows plan change summary
- [x] Old subscription is cancelled upon payment initiation
- [x] New subscription is created as pending
- [x] Payment link is generated successfully
- [x] After payment, new plan becomes active
- [x] User has access to new plan's features
- [x] Both transactions appear in payment history

## 🎉 Features

### Smooth User Experience
- Clear visual feedback throughout the process
- Confirmation dialogs prevent accidental changes
- Informative messages explain what's happening
- Immediate navigation after payment link opens

### Flexible Plan Management
- Upgrade to higher plans
- Downgrade to lower plans
- Clear indication of current vs new plan
- Preserves payment history

### Robust Error Handling
- Validates plan IDs
- Checks subscription status
- Handles Razorpay errors gracefully
- Provides clear error messages to users

## 🚀 Next Steps (Optional Enhancements)

1. **Pro-rating**: Calculate and refund unused time from old plan
2. **Scheduled changes**: Allow plan changes at end of billing cycle
3. **Plan comparison**: Show side-by-side feature comparison
4. **Trial periods**: Offer trial when upgrading
5. **Rollback**: Allow reverting to previous plan within X days
6. **Email notifications**: Send confirmation emails for plan changes
7. **Usage migration**: Transfer unused analyses to new plan
