# Grant Admin Role on Railway Database

## The Problem

You logged into the admin dashboard with Google Sign-In, which created a new user account:
- **Username**: `hackn3y_e28ar`
- **Email**: `hackn3y@gmail.com`
- **Role**: `user` (not admin)

This account exists in the **Railway production database**, not your local database.

## The Solution

Update the user's role to `admin` directly in the Railway PostgreSQL database.

---

## Option 1: Railway PostgreSQL Console (Recommended)

### Step 1: Open Railway Database Console

1. Go to **https://railway.app**
2. Select your **Intentional Movement** project
3. Click on your **PostgreSQL** service (database)
4. Click **Data** tab
5. Click **Query** (opens SQL console)

### Step 2: Run SQL Commands

Copy and paste these commands **one at a time**:

**1. Check if user exists:**
```sql
SELECT id, username, email, "displayName", role, "createdAt"
FROM "Users"
WHERE username = 'hackn3y_e28ar'
ORDER BY "createdAt" DESC;
```

**2. Grant admin role:**
```sql
UPDATE "Users"
SET role = 'admin', "updatedAt" = NOW()
WHERE username = 'hackn3y_e28ar';
```

**3. Verify the update:**
```sql
SELECT username, email, role
FROM "Users"
WHERE username = 'hackn3y_e28ar';
```

You should see:
```
username       | email              | role
---------------|--------------------|-----
hackn3y_e28ar  | hackn3y@gmail.com | admin
```

### Step 3: Test Admin Dashboard

1. Go back to **https://adminintentionalmovement.netlify.app**
2. **Refresh the page** (Ctrl+R or Cmd+R)
3. Sign in with Google again
4. You should now have admin access!

---

## Option 2: Railway CLI (Alternative)

If you prefer using the command line:

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Link to Your Project

```bash
cd backend
railway link
```

Select your project and environment.

### Step 4: Run SQL Command

```bash
railway run psql -c "UPDATE \"Users\" SET role = 'admin', \"updatedAt\" = NOW() WHERE username = 'hackn3y_e28ar';"
```

### Step 5: Verify

```bash
railway run psql -c "SELECT username, email, role FROM \"Users\" WHERE username = 'hackn3y_e28ar';"
```

---

## Option 3: Create an Admin Endpoint (For Future)

You could create a temporary admin endpoint to grant privileges via API, but this requires code changes and is less secure.

---

## Your Multiple Accounts

You now have **THREE** accounts with email `hackn3y@gmail.com`:

### Account 1: hackn3y@gmail.com (username: @hackn3y)
- Database: Local SQLite
- Role: admin ✅
- Created: Oct 14, 2025

### Account 2: hackn3@gmail.com (username: @hackn3)
- Database: Local SQLite (and possibly Railway)
- Role: admin ✅
- Created: Oct 20, 2025

### Account 3: hackn3y@gmail.com (username: @hackn3y_e28ar)
- Database: **Railway PostgreSQL (Production)**
- Role: user ❌ (needs to be changed to admin)
- Created: Oct 21, 2025 (just now via Google Sign-In)

The third account is the one you're using on the admin dashboard right now.

---

## Why Multiple Accounts?

The authentication system creates a new user when it can't find an existing one. This happens because:

1. **Different databases**: Local (SQLite) vs Production (PostgreSQL)
2. **Username generation**: The system generates unique usernames like `hackn3y_e28ar` to avoid conflicts
3. **Email matching**: The system checks by email, but your `hackn3y@gmail.com` account only exists locally, not on Railway

---

## Quick Fix Summary

**Fastest solution:**
1. Go to Railway → PostgreSQL → Data → Query
2. Run: `UPDATE "Users" SET role = 'admin' WHERE username = 'hackn3y_e28ar';`
3. Refresh admin dashboard
4. You now have admin access!

---

## Verification Checklist

After running the SQL command:

- [ ] SQL command executed successfully
- [ ] Verification query shows `role: admin`
- [ ] Admin dashboard refreshed
- [ ] Can see admin features (Users, Analytics, etc.)
- [ ] No "not admin" error messages

---

**Last Updated:** October 21, 2025
**Action Required:** Update user role in Railway PostgreSQL database
