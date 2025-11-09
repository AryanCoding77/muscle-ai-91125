@echo off
echo ========================================
echo  Deploying Account Deletion System
echo ========================================
echo.

echo Step 1: Running Supabase Migration...
echo.
supabase db push --db-url "postgresql://postgres.mhnfxqpvxpynsnsihqxm:BumAa81221@@@@@@@@@@@@##aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
echo.

if %errorlevel% neq 0 (
    echo ❌ Migration failed!
    pause
    exit /b 1
)

echo.
echo ✅ Account Deletion System Deployed Successfully!
echo.
echo 📋 What was deployed:
echo    ✓ Database table: account_deletion_requests
echo    ✓ RLS Policies for secure access
echo    ✓ Frontend: DeletionRequestDialog component
echo    ✓ Backend: accountDeletionService
echo    ✓ UI: Request Account Deletion option in Settings
echo.
echo 📖 Next Steps:
echo    1. Users can now request account deletion from Settings
echo    2. Check Supabase dashboard for deletion requests
echo    3. Contact users via email to process their requests
echo.
pause
