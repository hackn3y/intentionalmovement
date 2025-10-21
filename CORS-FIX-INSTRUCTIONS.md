# CORS Fix - Add Admin Dashboard URL to Railway

## The Problem

The admin dashboard at `https://adminintentionalmovement.netlify.app` is being blocked by CORS because Railway's backend doesn't have this URL in its allowed origins.

**Error:**
```
Access to XMLHttpRequest at 'https://intentionalmovement-production.up.railway.app/api/auth/login'
from origin 'https://adminintentionalmovement.netlify.app' has been blocked by CORS policy
```

---

## The Solution

Add `https://adminintentionalmovement.netlify.app` to Railway's `CORS_ORIGIN` environment variable.

---

## Step-by-Step Instructions

### 1. Go to Railway Dashboard
- Visit: **https://railway.app**
- Log in with your account

### 2. Navigate to Backend Service
- Select: **Intentional Movement** project
- Click on: **backend** service (the Node.js API)

### 3. Open Variables Tab
- Click: **Variables** tab in the top navigation

### 4. Find CORS_ORIGIN Variable
- Look for the variable named: `CORS_ORIGIN`
- Click the **Edit** button (pencil icon)

### 5. Update the Value

**Add this URL to the existing value:**
```
https://adminintentionalmovement.netlify.app
```

**The full value should look like this:**
```
http://localhost:3000,http://localhost:3002,http://localhost:2221,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8091,http://localhost:8092,http://localhost:19006,http://192.168.50.41:3001,http://192.168.50.41:8081,http://192.168.50.41:8083,https://intentionalmovement.netlify.app,https://adminintentionalmovement.netlify.app
```

**IMPORTANT:** Separate URLs with commas, NO spaces.

### 6. Save the Variable
- Click: **Add** or **Update**
- Railway will **automatically redeploy** the backend

### 7. Wait for Deployment
- Go to: **Deployments** tab
- Wait for the new deployment to complete (2-3 minutes)
- Status should show: **Success** with a green checkmark

### 8. Test the Fix
- Go to: **https://adminintentionalmovement.netlify.app**
- Try logging in with:
  - Email/Username: `hackn3@gmail.com` or `hackn3`
  - Password: (your password)
- OR use Google Sign-In
- Login should work without CORS errors

---

## Visual Guide

```
Railway Dashboard
  └─ [Your Project]
      └─ backend (service)
          └─ Variables (tab)
              └─ CORS_ORIGIN (variable)
                  └─ Click Edit
                      └─ Add: ,https://adminintentionalmovement.netlify.app
                      └─ Click Save
                      └─ Wait for auto-redeploy
```

---

## Your Admin Accounts

You have **TWO** admin accounts now:

### Account 1: hackn3y@gmail.com
- Username: `@hackn3y`
- Role: **admin** ✅
- Created: Oct 14, 2025

### Account 2: hackn3@gmail.com (currently logged in on mobile)
- Username: `@hackn3`
- Role: **admin** ✅
- Created: Oct 20, 2025

Both accounts can log into the admin dashboard once CORS is fixed.

---

## Troubleshooting

### "I don't see CORS_ORIGIN variable"

If you don't see the variable:
1. Click **+ New Variable**
2. Name: `CORS_ORIGIN`
3. Value: (paste the full URL list from step 5 above)
4. Click **Add**

### "Still getting CORS errors after update"

1. **Check deployment completed:**
   - Go to Deployments tab
   - Latest deployment should show "Success"

2. **Check Railway logs:**
   - Click on the latest deployment
   - Look for: `CORS allowed origins: [...]`
   - Verify `adminintentionalmovement.netlify.app` is in the list

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

4. **Check the exact error:**
   - Open browser console (F12)
   - Look for the blocked origin in the error message
   - Make sure it matches exactly what you added

### "Railway is not redeploying"

Manually trigger deployment:
1. Go to **Deployments** tab
2. Click **Deploy** button
3. Or make a small change to backend code and push to GitHub

---

## Quick Verification

After updating Railway:

✅ Railway CORS_ORIGIN updated
✅ Backend redeployed
✅ Can log into admin dashboard
✅ No CORS errors in console
✅ Admin features accessible

---

## Alternative: Use Wildcard for All Netlify Sites

If you want to allow ALL Netlify deployments (including preview deployments), you can use a wildcard:

**Replace:**
```
https://intentionalmovement.netlify.app,https://adminintentionalmovement.netlify.app
```

**With:**
```
https://*.netlify.app
```

This will allow:
- `https://intentionalmovement.netlify.app`
- `https://adminintentionalmovement.netlify.app`
- `https://deploy-preview-123--adminintentionalmovement.netlify.app`
- Any other `*.netlify.app` subdomain

**Full example with wildcard:**
```
http://localhost:3000,http://localhost:8081,https://*.netlify.app
```

---

**Last Updated:** October 21, 2025
**Status:** Waiting for Railway CORS_ORIGIN update
**Action Required:** Update Railway environment variable
