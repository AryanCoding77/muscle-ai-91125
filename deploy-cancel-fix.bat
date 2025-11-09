@echo off
echo ========================================
echo  Deploy Cancel Subscription Fix
echo ========================================
echo.

echo This script will deploy the enhanced cancel-subscription edge function
echo with comprehensive error handling and logging improvements.
echo.

echo [Step 1/3] Verifying Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI not found!
    echo Please install: npm install -g supabase
    pause
    exit /b 1
)
echo SUCCESS: Supabase CLI found
echo.

echo [Step 2/3] Deploying enhanced cancel-subscription function...
echo.
echo Improvements included:
echo - Enhanced error message extraction
echo - Comprehensive status validation
echo - Improved Razorpay error handling  
echo - Detailed logging throughout
echo - Better user feedback
echo.

supabase functions deploy cancel-subscription
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo Troubleshooting:
    echo 1. Make sure you're logged in: supabase login
    echo 2. Link your project: supabase link
    echo 3. Check function exists: dir supabase\functions\cancel-subscription
    pause
    exit /b 1
)
echo.
echo SUCCESS: Function deployed!
echo.

echo [Step 3/3] Verification...
supabase functions list | findstr "cancel-subscription"
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo What's been fixed:
echo  - Specific error messages for each scenario
echo  - Detailed logging for easy debugging
echo  - Better Razorpay error parsing
echo  - Comprehensive status validation
echo  - Improved user feedback
echo.
echo Next steps:
echo 1. Restart your app: npx expo start --clear
echo 2. Test cancellation flow
echo 3. Check logs: supabase functions logs cancel-subscription --tail
echo 4. Review CANCEL_SUBSCRIPTION_FIX.md for details
echo.
echo To view logs:
echo   supabase functions logs cancel-subscription --tail
echo.
pause
