# Railway CORS Update for Admin Dashboard

## Issue

The admin dashboard at `https://adminintentionalmovement.netlify.app` is blocked by CORS when trying to authenticate with the backend.

**Error:**
```
Access to XMLHttpRequest at 'https://intentionalmovement-production.up.railway.app/api/auth/firebase'
from origin 'https://adminintentionalmovement.netlify.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

Add the admin dashboard URL to the `CORS_ORIGIN` environment variable on Railway.

---

## Step-by-Step Instructions

### 1. Go to Railway Backend Service

1. Visit: https://railway.app
2. Log in to your account
3. Select the **Intentional Movement** project
4. Click on the **backend service**

### 2. Update Environment Variables

1. Click on **Variables** tab
2. Find the `CORS_ORIGIN` variable
3. Click **Edit** (pencil icon)

### 3. Add Admin Dashboard URL

**Current CORS_ORIGIN value** (approximately):
```
http://localhost:3000,http://localhost:8081,http://localhost:8091,http://localhost:8092,http://localhost:19006
```

**NEW CORS_ORIGIN value** (add admin dashboard URL):
```
http://localhost:3000,http://localhost:8081,http://localhost:8091,http://localhost:8092,http://localhost:19006,https://adminintentionalmovement.netlify.app
```

**If you also have a mobile app URL, add it too:**
```
http://localhost:3000,http://localhost:8081,http://localhost:8091,http://localhost:8092,http://localhost:19006,https://adminintentionalmovement.netlify.app,https://intentionalmovementapp.netlify.app
```

### 4. Save and Redeploy

1. Click **Save** or **Add Variable**
2. Railway will **automatically redeploy** the backend service
3. Wait 2-3 minutes for deployment to complete

### 5. Verify the Fix

1. Go to: https://adminintentionalmovement.netlify.app
2. Try logging in with Google
3. Login should now work without CORS errors

---

## Technical Details

### How CORS Works in the Backend

The backend reads the `CORS_ORIGIN` environment variable and splits it by commas (line 61 in `server.js`):

```javascript
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) ||
  ['http://localhost:3000', 'http://localhost:8081', ...defaults];
```

### CORS Origin Checker

The backend uses a custom CORS checker that:
- Allows requests with no origin (mobile apps, Postman)
- Supports wildcard patterns (e.g., `https://*.vercel.app`)
- Logs blocked origins for debugging

**Code reference:** `backend/src/server.js:65-93`

### Wildcard Support

If you want to allow ALL Netlify deployments (including preview deploys), you can use:
```
https://*.netlify.app
```

**Example:**
```
http://localhost:3000,http://localhost:8081,https://*.netlify.app
```

This will allow:
- `https://adminintentionalmovement.netlify.app`
- `https://intentionalmovementapp.netlify.app`
- `https://deploy-preview-123--adminintentionalmovement.netlify.app`
- Any other `*.netlify.app` subdomain

---

## Verification Checklist

After updating CORS_ORIGIN on Railway:

- [ ] CORS_ORIGIN updated with admin dashboard URL
- [ ] Railway backend redeployed automatically
- [ ] Checked deployment logs for errors
- [ ] Tested Google sign-in on admin dashboard
- [ ] No CORS errors in browser console
- [ ] Successfully logged into admin dashboard
- [ ] Admin features accessible (user management, analytics)

---

## Troubleshooting

### Railway Didn't Redeploy Automatically

1. Go to **Deployments** tab
2. Click **Deploy** button manually
3. Select the latest commit
4. Wait for deployment to complete

### Still Getting CORS Errors

1. Check Railway logs for CORS configuration:
   ```
   CORS allowed origins: ["http://localhost:3000","http://localhost:8081",...]
   ```

2. Verify the admin dashboard URL is in the list

3. Check browser console for the exact origin being blocked

4. Make sure there are no extra spaces or typos in the URL

### CORS Logs

The backend logs blocked origins:
```
CORS BLOCKED origin: https://adminintentionalmovement.netlify.app
```

Check Railway logs under **Deployments** → **View Logs** to see if the origin is being blocked.

---

## Admin Privileges Status

✅ **COMPLETED:** Your account `hackn3y@gmail.com` already has admin role.

**Verification:**
```
Found user: hackn3y (hackn3y@gmail.com)
Current role: admin
✅ User already has admin role!
```

Once CORS is fixed, you should be able to:
- Log in with Google
- Access admin dashboard features
- Manage users
- View analytics
- Moderate content

---

## Summary

**What needs to be done:**
1. Add `https://adminintentionalmovement.netlify.app` to Railway `CORS_ORIGIN` variable
2. Wait for automatic redeploy (2-3 minutes)
3. Test Google sign-in on admin dashboard

**Expected result:**
- No CORS errors
- Successful Google authentication
- Admin dashboard fully functional

---

**Last Updated:** October 21, 2025
**Status:** Waiting for Railway CORS_ORIGIN update
