@echo off
echo ========================================
echo  Deploy Authentication Fix
echo ========================================
echo.

echo Problem: "Unauthorized" error when cancelling subscription
echo Solution: Fixed authentication by using separate clients
echo.

echo [Step 1/2] Deploying fixed cancel-subscription function...
echo.

supabase functions deploy cancel-subscription
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo Make sure:
    echo 1. You're logged in: supabase login
    echo 2. Project is linked: supabase link
    pause
    exit /b 1
)

echo.
echo SUCCESS: Function deployed with authentication fix!
echo.

echo [Step 2/2] What was fixed:
echo  - Using anon key for user authentication
echo  - Using service role for database operations
echo  - Added better error logging
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart app: npx expo start --clear
echo 2. Try cancelling a subscription
echo 3. Should work without "Unauthorized" error
echo.
echo To view logs:
echo   supabase functions logs cancel-subscription --tail
echo.
pause
