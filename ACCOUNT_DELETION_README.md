# Account Deletion Request System

A complete system for handling user account deletion requests with proper tracking and communication.

## 📋 Overview

This system allows users to request account deletion through the app. Requests are stored in Supabase with user information and reason, enabling proper review and communication before final deletion.

## 🏗️ Architecture

### Database Layer
- **Table**: `account_deletion_requests`
- **Columns**:
  - `id`: UUID primary key
  - `user_id`: Reference to auth.users
  - `email`: User's email address
  - `reason`: User-provided reason for deletion (max 500 chars)
  - `status`: pending | processing | completed | cancelled
  - `created_at`: Request timestamp
  - `updated_at`: Last update timestamp

### Security
- **Row Level Security (RLS)** enabled
- Users can only:
  - Insert their own deletion requests
  - View their own deletion requests
- Prevents duplicate pending requests

### Frontend Components

1. **DeletionRequestDialog** (`src/components/ui/DeletionRequestDialog.tsx`)
   - Modal dialog for collecting deletion reason
   - Input validation (required, max 500 chars)
   - Character counter
   - Loading states
   - User-friendly information message

2. **SettingsScreen** (`src/screens/SettingsScreen.tsx`)
   - "Request Account Deletion" option in Support section
   - Red icon and white text for visibility
   - Integrated haptic feedback
   - Success/error alerts

### Service Layer

**accountDeletionService** (`src/services/accountDeletionService.ts`)

Functions:
- `submitAccountDeletionRequest(params)`: Submit a new deletion request
- `getUserDeletionRequests()`: Fetch user's deletion requests
- `hasPendingDeletionRequest()`: Check for pending requests

## 🚀 Deployment

### Deploy to Production

Run the deployment script:

```bash
deploy-account-deletion.bat
```

This will:
1. ✅ Create the `account_deletion_requests` table
2. ✅ Set up RLS policies
3. ✅ Create necessary indexes
4. ✅ Enable automatic timestamp updates

### Manual Deployment

If you prefer to deploy manually:

```bash
supabase db push --db-url "your-database-url"
```

## 📱 User Flow

1. **Request Submission**:
   - User navigates to Settings → Support
   - Taps "Request Account Deletion"
   - Modal appears requesting reason
   - User enters reason (required, 1-500 chars)
   - Submits request

2. **Confirmation**:
   - Success alert: "Your deletion request has been submitted successfully. We will contact you via email shortly."
   - Dialog closes
   - User can continue using the app

3. **Duplicate Prevention**:
   - If user already has a pending request
   - Shows message: "You already have a pending deletion request. Please wait for our response."

## 🔧 Admin Actions

### View Deletion Requests

In Supabase Dashboard:

```sql
SELECT 
  id,
  user_id,
  email,
  reason,
  status,
  created_at,
  updated_at
FROM account_deletion_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Update Request Status

```sql
-- Mark as processing
UPDATE account_deletion_requests
SET status = 'processing'
WHERE id = 'request-id';

-- Mark as completed after deletion
UPDATE account_deletion_requests
SET status = 'completed'
WHERE id = 'request-id';

-- Cancel request
UPDATE account_deletion_requests
SET status = 'cancelled'
WHERE id = 'request-id';
```

### View User Information

```sql
SELECT 
  adr.*,
  u.email as auth_email,
  u.created_at as user_created_at
FROM account_deletion_requests adr
JOIN auth.users u ON u.id = adr.user_id
WHERE adr.status = 'pending';
```

## 📧 Communication Template

When contacting users about their deletion request:

**Subject**: Your Account Deletion Request - [App Name]

**Body**:
```
Dear [User Name],

We received your request to delete your account on [Date].

Reason provided: "[User's reason]"

Before we proceed, please note:
- All your data will be permanently deleted
- This action cannot be undone
- Your subscription (if active) will be cancelled

If you wish to proceed, please reply to this email with "CONFIRM DELETE".

If you've changed your mind, no action is needed.

Best regards,
[Your Team]
```

## 🔍 Monitoring

### Check Pending Requests Count

```sql
SELECT COUNT(*) as pending_requests
FROM account_deletion_requests
WHERE status = 'pending';
```

### Track Request Trends

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as requests,
  status
FROM account_deletion_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), status
ORDER BY date DESC;
```

## 🛡️ Data Privacy Compliance

This system helps comply with:
- **GDPR** (Right to Erasure)
- **CCPA** (Right to Delete)
- **Other privacy regulations**

### Important Notes:
- Requests are logged with timestamps
- User consent (reason) is recorded
- Audit trail maintained
- Secure deletion process

## 🧪 Testing

### Test the Flow

1. Open the app
2. Navigate to Settings
3. Tap "Request Account Deletion"
4. Enter a test reason
5. Submit request
6. Check Supabase dashboard for the entry

### Test Duplicate Prevention

1. Submit a deletion request
2. Try to submit another request
3. Should see: "You already have a pending deletion request..."

## 📊 Database Schema

```sql
CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🎨 UI Features

- ✅ Red icon for high visibility
- ✅ White text for contrast
- ✅ Haptic feedback on interactions
- ✅ Character counter for reason input
- ✅ Loading states during submission
- ✅ Clear success/error messages
- ✅ Prevents empty submissions
- ✅ Scrollable dialog for long content

## 🔄 Future Enhancements

Consider adding:
- [ ] Email automation for deletion requests
- [ ] In-app notification when request is processed
- [ ] Request history view for users
- [ ] Bulk deletion processing for admins
- [ ] Automated deletion after confirmation
- [ ] Data export before deletion

## 📝 Files Modified/Created

### Created Files:
1. `supabase/migrations/create_account_deletion_requests_table.sql`
2. `src/services/accountDeletionService.ts`
3. `src/components/ui/DeletionRequestDialog.tsx`
4. `deploy-account-deletion.bat`
5. `ACCOUNT_DELETION_README.md`

### Modified Files:
1. `src/screens/SettingsScreen.tsx`

## ✅ Status

**🟢 PRODUCTION READY**

All components are tested and ready for deployment.

## 🆘 Troubleshooting

### Request not submitting?
- Check user authentication
- Verify Supabase connection
- Check browser/app console for errors

### Duplicate request error?
- Check if user has a pending request in database
- Update old request status if needed

### Dialog not showing?
- Check DeletionRequestDialog import
- Verify state management in SettingsScreen

## 📞 Support

For issues or questions:
1. Check Supabase logs
2. Review console errors
3. Verify RLS policies
4. Check user permissions

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
