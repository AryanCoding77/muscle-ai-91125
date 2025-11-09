@echo off
echo ========================================
echo  Test Cancel Subscription System
echo ========================================
echo.

echo This script will help you test the cancel subscription system
echo.

echo [1] Check if edge function is deployed
echo.
supabase functions list | findstr "cancel-subscription"
if %errorlevel% neq 0 (
    echo WARNING: cancel-subscription function not found in deployed functions
    echo Please deploy it first: supabase functions deploy cancel-subscription
    echo.
) else (
    echo SUCCESS: cancel-subscription function is deployed
    echo.
)

echo [2] View recent logs
echo.
echo Fetching last 10 log entries...
supabase functions logs cancel-subscription --limit 10
echo.

echo [3] Test with manual request
echo.
echo To test manually, use this curl command:
echo.
echo curl -X POST \
echo   https://YOUR_PROJECT.supabase.co/functions/v1/cancel-subscription \
echo   -H "Authorization: Bearer YOUR_USER_TOKEN" \
echo   -H "Content-Type: application/json" \
echo   -d "{\"subscription_id\": \"YOUR_SUBSCRIPTION_ID\"}"
echo.

echo [4] Check database for cancelled subscriptions
echo.
echo Run this SQL query in Supabase SQL Editor:
echo.
echo SELECT user_id, plan_id, subscription_status, cancelled_at
echo FROM user_subscriptions
echo WHERE subscription_status = 'cancelled'
echo ORDER BY cancelled_at DESC;
echo.

echo ========================================
echo  Testing Guide Complete
echo ========================================
echo.
echo To test in the app:
echo 1. Subscribe to any plan
echo 2. Go to Profile ^> Tap subscription banner
echo 3. Tap "Cancel Subscription" button
echo 4. Confirm in dialog
echo 5. Check that status shows CANCELLED
echo.
pause
