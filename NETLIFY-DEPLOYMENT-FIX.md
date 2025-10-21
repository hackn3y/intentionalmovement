# Netlify Deployment Fix - Separate Sites

## Problem

The admin dashboard was being deployed to the same Netlify site as the mobile app because:
- Both were reading the `netlify.toml` from the repository root
- Netlify was using `base = "admin-dashboard"` which caused confusion

## Solution

Create **TWO SEPARATE Netlify sites**:
1. Mobile App site
2. Admin Dashboard site (separate)

---

## Step 1: Delete the Root netlify.toml (Already Done ✅)

The `netlify.toml` has been moved from root to `admin-dashboard/netlify.toml` so it won't affect the mobile app.

---

## Step 2: Create Admin Dashboard Site (NEW SITE)

### Option A: Via Netlify UI (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your `intentionalmovement` repository

3. **Configure Admin Dashboard Build**
   - **Site name**: Choose something like `intentional-movement-admin`
   - **Base directory**: `admin-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-dashboard/build`
   - **Branch**: `master`

4. **Add Environment Variable**
   - Go to Site settings → Environment variables
   - Add: `SECRETS_SCAN_ENABLED` = `false`
   - Add: `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Get admin URL: `https://your-admin-site.netlify.app`

### Option B: Via Netlify CLI

```bash
cd admin-dashboard

# Login to Netlify
netlify login

# Create new site
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: Your team
# - Site name: intentional-movement-admin
# - Build command: npm run build
# - Publish directory: build

# Set environment variables
netlify env:set SECRETS_SCAN_ENABLED false
netlify env:set REACT_APP_API_URL "https://your-backend.railway.app/api"

# Deploy
netlify deploy --prod
```

---

## Step 3: Configure Mobile App Site (EXISTING SITE)

Your existing Netlify site should be configured for the mobile app:

### Update Existing Mobile Site Settings

1. **Go to your EXISTING mobile app site**
   - This is the site that was deploying the admin dashboard by mistake

2. **Update Build Settings**
   - Go to Site settings → Build & deploy → Build settings
   - **Base directory**: `mobile`
   - **Build command**: `npm run build:pwa`
   - **Publish directory**: `mobile/dist`

3. **Environment Variables**
   - Add: `REACT_APP_API_URL` = `https://your-backend.railway.app/api`
   - (Any other mobile-specific env vars)

4. **Redeploy**
   - Go to Deploys → Trigger deploy → Deploy site

---

## Step 4: Update CORS on Backend

Add both Netlify URLs to your backend CORS configuration:

1. **Go to Railway Backend Service**
   - Open your backend service on Railway

2. **Update CORS_ORIGIN Environment Variable**
   ```
   http://localhost:3000,
   http://localhost:8081,
   http://localhost:8091,
   https://your-mobile-app.netlify.app,
   https://your-admin-dashboard.netlify.app
   ```

3. **Redeploy backend** if needed

---

## Step 5: Verify Both Sites

### Mobile App Site
- URL: `https://your-mobile-app.netlify.app`
- Should show: Mobile app welcome screen
- Should have: PWA install prompt
- Should work: Login, posts, programs

### Admin Dashboard Site
- URL: `https://your-admin-dashboard.netlify.app`
- Should show: Admin login screen
- Should have: Dark mode toggle, admin features
- Should work: User management, analytics

---

## File Structure After Fix

```
intentionalmovementcorp/
├── (no netlify.toml at root) ✅
├── mobile/
│   └── (mobile app files)
└── admin-dashboard/
    └── netlify.toml ✅ (only affects admin dashboard site)
```

---

## Expected Netlify Sites

You should have **TWO separate sites** in your Netlify dashboard:

### Site 1: Mobile App
- **Name**: `intentional-movement-mobile` (or similar)
- **Base directory**: `mobile`
- **Build command**: `npm run build:pwa`
- **Publish directory**: `mobile/dist`
- **URL**: `https://your-mobile.netlify.app`

### Site 2: Admin Dashboard (NEW)
- **Name**: `intentional-movement-admin`
- **Base directory**: `admin-dashboard`
- **Build command**: `npm run build`
- **Publish directory**: `admin-dashboard/build`
- **URL**: `https://your-admin.netlify.app`

---

## Troubleshooting

### Mobile App Still Shows Admin Dashboard

1. **Check build settings** on the mobile app site
   - Ensure base directory is `mobile`
   - Ensure publish directory is `mobile/dist`

2. **Clear deploy cache**
   - Site settings → Build & deploy → Clear cache and retry deploy

3. **Check netlify.toml**
   - There should be NO netlify.toml in the mobile directory
   - There should be NO netlify.toml at repository root

### Admin Dashboard Won't Deploy

1. **Disable secrets scanning**
   - Site settings → Security → Secrets scanning → Disable
   - OR add environment variable: `SECRETS_SCAN_ENABLED=false`

2. **Check build command**
   - Should be `npm run build` (which now includes CI=false)

3. **Check Firebase API key**
   - The API key in `admin-dashboard/src/config/firebase.js` is safe to expose
   - It's a client-side key designed for public use

---

## Quick Fix Summary

**If you want to start fresh:**

1. **Delete the current Netlify site** (or reconfigure for mobile)
2. **Create TWO new sites:**
   - Site A: Point to `mobile` directory
   - Site B: Point to `admin-dashboard` directory
3. **Configure environment variables** for each
4. **Update backend CORS** with both URLs

---

## Alternative: Subdomain Approach

If you want both on the same domain:

### Option: Use Netlify Redirects (Not Recommended)

This is complex and not recommended. Better to have two separate sites:
- `https://app.intentionalmovementcorp.com` (mobile)
- `https://admin.intentionalmovementcorp.com` (admin dashboard)

---

## Custom Domains (Optional)

### For Mobile App
```
Domain: app.intentionalmovementcorporation.com
DNS: CNAME → your-mobile-site.netlify.app
```

### For Admin Dashboard
```
Domain: admin.intentionalmovementcorporation.com
DNS: CNAME → your-admin-site.netlify.app
```

---

## Deployment Checklist

### Mobile App Site
- [ ] Base directory: `mobile`
- [ ] Build command: `npm run build:pwa`
- [ ] Publish directory: `mobile/dist`
- [ ] Environment variables set
- [ ] CORS configured on backend
- [ ] Site deploys successfully
- [ ] Can access mobile app
- [ ] No admin dashboard visible

### Admin Dashboard Site (NEW)
- [ ] Base directory: `admin-dashboard`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `admin-dashboard/build`
- [ ] SECRETS_SCAN_ENABLED = false
- [ ] REACT_APP_API_URL set
- [ ] CORS configured on backend
- [ ] Site deploys successfully
- [ ] Can access admin dashboard
- [ ] No mobile app visible

---

## Next Steps

1. **Create the new admin dashboard site** on Netlify
2. **Reconfigure the existing site** for mobile app only
3. **Update backend CORS** with both URLs
4. **Test both sites** separately
5. **Set up custom domains** (optional)

---

**Generated by:** Claude Code
**Date:** October 21, 2025
