# Quick Test Guide - Plan Change System

## 🚀 Deploy First

```bash
# Run this command to deploy the edge function
deploy-change-plan.bat
```

## ✅ Quick Test Steps

### 1. Setup (If you don't have an active subscription)
- Open the app
- Sign in
- Go to **Subscription Plans**
- Subscribe to **Basic** plan
- Complete payment
- Wait 1-2 minutes for activation
- Go to **Manage Subscription** to verify it's active

### 2. Test Plan Change (Upgrade)
1. Go to **Manage Subscription**
2. Click **Change Plan** button
3. You'll be redirected to **Subscription Plans** screen
4. Select **Pro** or **VIP** plan (any plan except your current one)
5. Confirmation dialog appears:
   - Title: "Change Plan"
   - Message: "Switch from Basic to Pro?"
   - Buttons: "Continue" and "Cancel"
6. Click **Continue**
7. **Payment Screen** should show:
   ```
   Plan Change Summary
   
   Current Plan: Basic (strikethrough)
           ↓
   New Plan: Pro
   Monthly Analyses: [number]
   Amount: $X/month
   
   💡 Your current plan will be cancelled and the new plan will start immediately after payment.
   ```
8. Click **Pay $X**
9. Browser opens with Razorpay payment link
10. Complete the payment
11. Return to app
12. Go to **Manage Subscription**
13. Pull to refresh
14. Verify:
    - Plan shows **Pro** (or selected plan)
    - Status: **ACTIVE**
    - Usage reset to new plan's limits

### 3. Test Plan Change (Downgrade)
- Same steps as above, but select a lower-priced plan
- E.g., from Pro → Basic

### 4. Test Error Case - Same Plan
1. Go to **Manage Subscription**
2. Click **Change Plan**
3. Select the plan you're already on (e.g., if you're on Basic, select Basic)
4. Click **Get Started** on the current plan
5. Dialog should appear: "You are already subscribed to this plan"

## 🐛 What to Check

### ✅ Before Payment
- [ ] "Change Plan" button appears when subscription is active
- [ ] Confirmation dialog shows correct plan names
- [ ] Payment screen shows plan comparison (old → new)
- [ ] Payment screen header says "Change Plan"
- [ ] Change notice appears explaining cancellation

### ✅ After Payment
- [ ] Old subscription status = 'cancelled' in database
- [ ] New subscription status = 'active' in database
- [ ] User sees new plan in Manage Subscription
- [ ] Usage counter reset for new plan
- [ ] Both transactions appear in payment history

### ✅ Console Logs (Check Terminal)
Should see:
```
🔄 Initiating plan change...
🔄 Changing subscription plan to: [plan_id]
📦 Change Plan Response: { data: {...}, error: null }
✅ Plan change initiated: {...}
```

## 🚫 Common Issues

### Issue: "User already has an active subscription" error
**Cause**: The old `create-subscription` function is being called instead of `change-subscription-plan`
**Fix**: 
- Check that edge function is deployed: `deploy-change-plan.bat`
- Verify PaymentScreen is receiving `isUpgrade: true` parameter
- Check console logs to see which function is being called

### Issue: Payment link not opening
**Cause**: Browser permissions or Razorpay configuration
**Fix**:
- Check if Razorpay keys are configured in `.env`
- Verify edge function logs in Supabase dashboard
- Try opening link manually from console logs

### Issue: Old subscription still active
**Cause**: Edge function didn't cancel it properly
**Fix**:
- Check Supabase logs for errors
- Verify database permissions
- Manually check `user_subscriptions` table

## 📊 Database Check

### After successful plan change, verify in Supabase:

**user_subscriptions table:**
```sql
-- Should have 2 records for the user:
-- 1. Old subscription with status = 'cancelled'
-- 2. New subscription with status = 'active'

SELECT 
  id, 
  plan_id, 
  subscription_status, 
  created_at 
FROM user_subscriptions 
WHERE user_id = '[your-user-id]'
ORDER BY created_at DESC;
```

**payment_transactions table:**
```sql
-- Should have payments for both plans
SELECT 
  transaction_date,
  amount_paid_usd,
  payment_status
FROM payment_transactions
WHERE user_id = '[your-user-id]'
ORDER BY transaction_date DESC;
```

## 🎉 Success!

If all tests pass, the plan change system is working perfectly! Users can now:
- ✅ Upgrade to higher plans
- ✅ Downgrade to lower plans
- ✅ See clear confirmation before changing
- ✅ View their plan change in a nice UI
- ✅ Complete payment smoothly
- ✅ Get immediate access to new plan features

## 📝 Notes

- Plan changes are **immediate** (old plan cancelled right away)
- New plan activates **after payment**
- **No pro-rating** currently (pay full price for new plan)
- **Auto-renewal** is enabled by default on new plan
- **Payment history** keeps both transactions
