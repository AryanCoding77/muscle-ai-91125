@echo off
echo ========================================
echo Deploying Change Subscription Plan Edge Function
echo ========================================
echo.

echo Step 1: Deploying change-subscription-plan function...
call supabase functions deploy change-subscription-plan --no-verify-jwt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to deploy change-subscription-plan function
    pause
    exit /b 1
)

echo.
echo ✅ Change subscription plan function deployed successfully!
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo The plan change system is now ready to use.
echo Users can now upgrade or downgrade their subscription plans.
echo.
pause
