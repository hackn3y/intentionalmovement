# Fix Admin Dashboard Login - Add Role Column Migration

## Problem
The production PostgreSQL database on Railway is missing the `role` column in the `Users` table. This causes the admin dashboard authentication to fail because it can't verify admin permissions.

From the Railway logs:
```
isAdmin check skipped - role column does not exist in production
```

## Solution
Run the migration script `add-role-column.js` on Railway to add the missing column.

---

## Method 1: Railway CLI (Recommended)

### Prerequisites
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Link to your Railway project:
   ```bash
   railway link
   ```
   Select project: **disciplined-beauty**

3. Run the migration script:
   ```bash
   railway run node add-role-column.js
   ```

4. Wait for success message:
   ```
   === MIGRATION COMPLETE ===
   ✓ role column added successfully
   ✓ Default values set
   ✓ Admin users configured
   ```

5. Restart the backend service:
   - Go to Railway dashboard
   - Click on your backend service
   - Click "Restart" or redeploy

---

## Method 2: Railway Dashboard - One-Off Command

1. Go to https://railway.app/dashboard
2. Select project: **disciplined-beauty**
3. Click on your **backend service** (Node.js app)
4. Find **"Run Command"** or **"Shell"** option:
   - May be in **Settings** tab → **One-Off Command**
   - Or in **Deployments** → Latest deployment → **Shell**
5. Run:
   ```bash
   node add-role-column.js
   ```
6. Wait for success message
7. **Restart the backend service** from the dashboard

---

## Method 3: Temporary Start Command (Use with Caution)

### WARNING: This will run the migration every time the service starts!

1. Railway dashboard → Backend service → **Settings**
2. Find **"Start Command"**
3. **Temporarily** change from `npm start` to:
   ```bash
   node add-role-column.js && npm start
   ```
4. Save and wait for Railway to redeploy
5. Check logs for "MIGRATION COMPLETE"
6. **IMMEDIATELY** change start command back to `npm start`
7. Save again to redeploy

---

## What the Migration Does

1. ✅ Connects to Railway PostgreSQL database
2. ✅ Checks if `role` column already exists (safe to run multiple times)
3. ✅ Adds `role` column with ENUM('user', 'admin', 'moderator')
4. ✅ Sets default value to 'user'
5. ✅ Updates existing users with 'user' role
6. ✅ Sets 'admin' role for known admin emails:
   - hackn3y@gmail.com
   - admin@intentionalmovementcorp.com
7. ✅ Creates index on role column for performance
8. ✅ Verifies migration completed successfully

---

## Verification

After running the migration and restarting the service:

### 1. Check Railway Logs
You should see:
```
Database connected!
Database synced!
✓ Server successfully started on port 3001
```

And NO MORE:
```
isAdmin check skipped - role column does not exist in production
```

### 2. Test Admin Dashboard Login
1. Go to your admin dashboard URL
2. Login with: hackn3y@gmail.com
3. You should now have full admin access

### 3. Query Database (Optional)
In Railway → Postgres service → Query tab:
```sql
-- Check that role column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Users' AND column_name = 'role';

-- Check admin users
SELECT id, email, username, role
FROM "Users"
WHERE role = 'admin';
```

---

## Troubleshooting

### "Database: SQLite" in output
- ❌ You ran the script locally, not on Railway
- ✅ Use Railway CLI or Railway dashboard to run it

### "role column already exists"
- ✅ Migration already completed successfully
- Just restart the backend service

### Migration succeeds but admin check still fails
1. Verify the migration added the column:
   ```bash
   railway run node -e "require('./add-role-column.js')"
   ```
2. Restart the backend service
3. Clear browser cache and try logging in again

### Railway CLI not installed/configured
- Use Method 2 (Railway Dashboard) instead
- Or install Railway CLI: `npm i -g @railway/cli`

---

## After Migration

Once the migration is complete:

1. ✅ The `isAdmin` middleware will now work correctly
2. ✅ Only users with `role: 'admin'` can access admin endpoints
3. ✅ Admin dashboard login will require admin role
4. ✅ Regular users will be blocked from admin access

---

## Adding More Admins

After migration, to make another user an admin:

### Option 1: Direct SQL (Railway Dashboard)
```sql
UPDATE "Users"
SET role = 'admin'
WHERE email = 'newemail@example.com';
```

### Option 2: Update migration script
1. Edit `add-role-column.js`
2. Add email to `adminEmails` array (line 71-74):
   ```javascript
   const adminEmails = [
     'hackn3y@gmail.com',
     'admin@intentionalmovementcorp.com',
     'newemail@example.com'  // Add new admin email
   ];
   ```
3. Commit and push changes
4. Re-run migration (it's safe - won't duplicate columns)

---

## Code Changes Made

### 1. Created Migration Script
- **File**: `backend/add-role-column.js`
- Safely adds role column to production database
- Sets admin role for known emails

### 2. Updated Auth Middleware
- **File**: `backend/src/middleware/auth.js`
- `isAdmin` now properly checks role column
- `isModerator` now properly checks role column
- Both have fallback for migration transition period

### 3. User Model Already Has Role
- **File**: `backend/src/models/User.js` (lines 53-56)
- Role column definition already exists in model
- Just needed to exist in production database

---

## Summary

Run this command on Railway:
```bash
railway run node add-role-column.js
```

Then restart the backend service.

Done! Your admin dashboard should now work correctly.
