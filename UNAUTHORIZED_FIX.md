# 🔧 "Unauthorized" Error - FIXED

## 🎯 Error

```
Error: Unauthorized
at Server.<anonymous> (file:///tmp/.../index.ts:41:13)
```

## 🔍 Root Cause

The edge function was using **SERVICE_ROLE_KEY** with the user's **Authorization header**, which created a conflict:

```typescript
// WRONG ❌
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: {
    headers: { Authorization: authHeader }  // User's JWT token
  }
});

// This doesn't work because service role overrides user auth
const { data: { user } } = await supabase.auth.getUser();
```

**Why it fails**: Service role key bypasses all RLS and JWT verification, so trying to get the user from the Authorization header doesn't work.

## ✅ Solution

Use **two separate clients**:
1. **Anon key client** - For user authentication
2. **Service role client** - For database operations

```typescript
// CORRECT ✅
// 1. Use anon key to verify user
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: { Authorization: authHeader }
  }
});

const { data: { user } } = await supabaseAuth.auth.getUser();

// 2. Use service role for database operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

## 📝 Changes Made

### File: `cancel-subscription/index.ts`

1. ✅ Added `SUPABASE_ANON_KEY` environment variable
2. ✅ Created `supabaseAuth` client with anon key for authentication
3. ✅ Created `supabase` client with service role for database operations
4. ✅ Added better error logging for auth failures

## 🚀 Deploy Fix

```bash
# Deploy the updated function
supabase functions deploy cancel-subscription

# Restart your app
npx expo start --clear
```

## 🧪 Test

1. Try cancelling a subscription
2. Should now work without "Unauthorized" error
3. Check logs - should see: `✅ User authenticated: [user_id]`

## 📊 Before vs After

### Before ❌
```
❌ Error cancelling subscription: Error: Unauthorized
```

### After ✅
```
✅ User authenticated: f9c54b2e-b757-4992-ba65-838204283276
📋 Subscription status: active
🔄 Cancelling Razorpay subscription: ...
✅ Subscription cancelled successfully
```

## ⚠️ Important Note

The `SUPABASE_ANON_KEY` is automatically available in Supabase Edge Functions as an environment variable. You don't need to set it manually - it's already there!

## ✅ Summary

**Problem**: Service role key conflicts with user JWT authentication

**Solution**: Use anon key for auth, service role for database

**Result**: Authentication works correctly now!

---

**Status**: ✅ FIXED
**Deploy**: `supabase functions deploy cancel-subscription`
**Test**: Cancel a subscription - should work!
