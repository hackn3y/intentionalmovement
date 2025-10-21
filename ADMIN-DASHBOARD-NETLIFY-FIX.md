# Admin Dashboard Netlify Build Fix

## Problem

The admin dashboard Netlify site is failing to build with this error:
```
npm error Missing script: "build"
```

This happens because Netlify is running `npm run build` from the **root directory** instead of the **admin-dashboard** directory.

---

## Root Cause

The **Base directory** is not configured in Netlify UI settings. Netlify is:
- Running: `npm run build` from `/opt/build/repo` (root)
- But should run from: `/opt/build/repo/admin-dashboard`

---

## Solution

### Update Netlify Site Settings (UI)

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Select the admin dashboard site** (not the mobile site)
3. **Site settings** → **Build & deploy** → **Build settings**
4. Click **Edit settings**
5. **Configure these EXACT values**:

```
Base directory: admin-dashboard
Build command: npm run build
Publish directory: admin-dashboard/build
```

6. **Save** the settings
7. **Trigger a new deploy**:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**

---

## Verification

After saving, the build settings should show:
- ✅ Base directory: `admin-dashboard`
- ✅ Build command: `npm run build`
- ✅ Publish directory: `admin-dashboard/build`

The next deployment should succeed!

---

## Important Notes

### Do NOT Use netlify.toml

As per `NETLIFY-SETUP-INSTRUCTIONS.md`, you should **NOT use netlify.toml files** for either site. Both sites should be configured **only via Netlify UI**.

**Why?**
- Both sites share the same repository
- netlify.toml files affect all sites that deploy from this repo
- This causes conflicts where the mobile site settings affect the admin site

**Current situation:**
- `mobile/netlify.toml` exists (this is OK, it won't be read if base directory is set correctly)
- No `admin-dashboard/netlify.toml` (correct)
- No root `netlify.toml` (correct)

### Two Separate Sites Required

You should have **TWO separate Netlify sites**:

1. **Mobile App Site**
   - Base: `mobile`
   - Build: `npm run build:pwa`
   - Publish: `mobile/dist`

2. **Admin Dashboard Site** (the one failing)
   - Base: `admin-dashboard`
   - Build: `npm run build`
   - Publish: `admin-dashboard/build`

---

## Quick Fix Steps

1. Netlify → Admin Dashboard Site → Site settings
2. Build & deploy → Build settings → **Edit settings**
3. Set **Base directory** to: `admin-dashboard`
4. Verify **Build command** is: `npm run build`
5. Verify **Publish directory** is: `admin-dashboard/build`
6. **Save**
7. Deploys → **Trigger deploy** → Clear cache and deploy site

---

## Expected Result

After the fix, the build log should show:
```
❯ Current directory
  /opt/build/repo/admin-dashboard

$ npm run build
> admin-dashboard@0.1.0 build
> cross-env CI=false react-scripts build
```

And the build should complete successfully!

---

**Last Updated:** October 21, 2025
**Issue:** Base directory not configured in Netlify UI
**Fix:** Set base directory to `admin-dashboard` in Netlify site settings
