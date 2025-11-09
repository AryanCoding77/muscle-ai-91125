@echo off
echo ========================================
echo  Cancel Subscription System Deployment
echo ========================================
echo.

echo [Step 1/4] Checking Supabase CLI installation...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI not found!
    echo Please install it first: npm install -g supabase
    pause
    exit /b 1
)
echo SUCCESS: Supabase CLI found
echo.

echo [Step 2/4] Verifying project link...
supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Not logged in to Supabase
    echo Running login command...
    supabase login
    echo.
    echo Please link your project:
    echo   supabase link --project-ref YOUR_PROJECT_REF
    pause
    exit /b 1
)
echo SUCCESS: Supabase is configured
echo.

echo [Step 3/4] Deploying cancel-subscription edge function...
echo This will deploy: supabase/functions/cancel-subscription
echo.
supabase functions deploy cancel-subscription
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy cancel-subscription function
    echo.
    echo Troubleshooting tips:
    echo 1. Make sure you are linked to your project
    echo 2. Check that the function file exists at: supabase\functions\cancel-subscription\index.ts
    echo 3. Verify your environment secrets are set:
    echo    supabase secrets set RAZORPAY_KEY_ID=your_key
    echo    supabase secrets set RAZORPAY_KEY_SECRET=your_secret
    pause
    exit /b 1
)
echo.
echo SUCCESS: cancel-subscription function deployed!
echo.

echo [Step 4/4] Verifying deployment...
supabase functions list
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Your cancel subscription system is now live!
echo.
echo Next steps:
echo 1. Test cancellation with a test subscription
echo 2. View logs: supabase functions logs cancel-subscription
echo 3. Monitor in Supabase Dashboard
echo.
echo The cancel button is already in your app at:
echo   Profile Screen ^> Manage Subscription ^> Cancel Subscription
echo.
pause
