# Netlify Admin Dashboard - Final Fix for Publish Directory

## The Problem

The publish directory keeps showing as `admin-dashboard/admin-dashboard/build` (doubled path) even after trying to change it.

This is a caching/UI issue where Netlify is combining:
- Base directory: `admin-dashboard`
- Publish directory: `admin-dashboard/build`
- Result: `admin-dashboard/admin-dashboard/build` ❌

## Solution: Remove Base Directory

Instead of using Netlify's base directory feature, we'll use absolute paths and change directory in the build command.

### Step-by-Step Fix

1. **Go to Netlify** → Admin Dashboard Site → **Site settings**
2. **Build & deploy** → **Build settings** → Click **"Edit settings"** or **"Configure"**
3. **Set these EXACT values**:

```
Base directory: [LEAVE COMPLETELY EMPTY - DELETE ANY TEXT]
Build command: cd admin-dashboard && npm run build
Publish directory: admin-dashboard/build
```

4. **Important**: Make sure to:
   - **Clear/delete** the base directory field entirely (it should say "Not set")
   - The build command must include `cd admin-dashboard &&`
   - The publish directory should be the full path `admin-dashboard/build`

5. **Save** the settings

6. **Clear the deploy cache**:
   - Go to **Site settings** → **Build & deploy** → **Build settings**
   - Scroll down to **"Deploy settings"**
   - Click **"Clear cache and retry deploy"** button

7. **Trigger a new deploy**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Expected Configuration

After saving, the build settings should show:

| Setting | Value |
|---------|-------|
| Base directory | **Not set** |
| Build command | `cd admin-dashboard && npm run build` |
| Publish directory | `admin-dashboard/build` |

**Resolved config in build logs should show:**
```
build:
  base: /opt/build/repo
  command: cd admin-dashboard && npm run build
  publish: /opt/build/repo/admin-dashboard/build
```

---

## Why This Works

- **No base directory**: Netlify runs from repository root (`/opt/build/repo`)
- **cd in build command**: Changes to admin-dashboard before running npm
- **Absolute publish path**: Points directly to `admin-dashboard/build` (no doubling)

---

## Verification

After the next deploy, check the build logs for:

✅ **Current directory**: `/opt/build/repo` (root, not admin-dashboard)
✅ **Build command**: `cd admin-dashboard && npm run build`
✅ **Publish path**: `/opt/build/repo/admin-dashboard/build` (single path, not doubled)
✅ **Deploy success**: "Site is live"

---

## Alternative: Use Netlify CLI to Override

If the UI continues to have issues, you can deploy directly:

```bash
cd admin-dashboard
npm run build
netlify deploy --prod --dir=build
```

This bypasses the UI configuration entirely.

---

**Last Updated:** October 21, 2025
**Issue:** Doubled publish directory path
**Fix:** Remove base directory, use cd in build command, absolute publish path
