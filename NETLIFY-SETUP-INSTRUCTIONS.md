# Netlify Setup - Mobile App & Admin Dashboard

## IMPORTANT: No netlify.toml Files

Both Netlify sites are configured **ONLY via Netlify UI**, not via netlify.toml files. This prevents one site from affecting the other.

---

## Site 1: Mobile App

### Netlify UI Configuration

1. **Go to your mobile app site** on Netlify
2. **Site settings** → **Build & deploy** → **Build settings**
3. Click **Edit settings**
4. Configure:
   ```
   Base directory: mobile
   Build command: npm run build:pwa
   Publish directory: mobile/dist
   ```
5. **Environment variables** (Site settings → Environment variables):
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
6. **Save** and **trigger new deploy**

### Expected Result
- URL: `https://your-mobile-site.netlify.app`
- Shows: Mobile app (Welcome screen, PWA)
- NOT showing: Admin dashboard

---

## Site 2: Admin Dashboard

### Netlify UI Configuration

1. **Go to your admin dashboard site** on Netlify
2. **Site settings** → **Build & deploy** → **Build settings**
3. Click **Edit settings**
4. Configure:
   ```
   Base directory: admin-dashboard
   Build command: npm run build
   Publish directory: admin-dashboard/build
   ```
5. **Environment variables** (Site settings → Environment variables):
   ```
   SECRETS_SCAN_ENABLED=false
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
6. **Security** → **Secrets scanning** → **Disable** (or keep enabled with SECRETS_SCAN_ENABLED=false)
7. **Save** and **trigger new deploy**

### Expected Result
- URL: `https://your-admin-site.netlify.app`
- Shows: Admin dashboard (login screen, dark mode toggle)
- NOT showing: Mobile app

---

## Why No netlify.toml?

**Problem with netlify.toml:**
- Both sites read the same file from the repository
- Causes one site to deploy the wrong app
- Cannot have different configs for different sites

**Solution:**
- Configure each site manually in Netlify UI
- Each site has its own independent settings
- No conflicts between sites

---

## Build Settings Summary

### Mobile App Site
| Setting | Value |
|---------|-------|
| Base directory | `mobile` |
| Build command | `npm run build:pwa` |
| Publish directory | `mobile/dist` |
| Framework | Expo (detected) |

### Admin Dashboard Site
| Setting | Value |
|---------|-------|
| Base directory | `admin-dashboard` |
| Build command | `npm run build` |
| Publish directory | `admin-dashboard/build` |
| Framework | Create React App (detected) |

---

## Troubleshooting

### Mobile App Shows Admin Dashboard
**Fix:**
1. Go to mobile app site settings
2. Set base directory to `mobile`
3. Set publish directory to `mobile/dist`
4. Clear cache and redeploy

### Admin Dashboard Shows Mobile App
**Fix:**
1. Go to admin dashboard site settings
2. Set base directory to `admin-dashboard`
3. Set publish directory to `admin-dashboard/build`
4. Clear cache and redeploy

### Build Fails with "Missing script: build"
**Cause:** Running from wrong directory
**Fix:**
- Check base directory is set correctly
- Mobile needs `mobile/`, Admin needs `admin-dashboard/`

### Secrets Scanning Blocks Admin Deploy
**Fix:**
1. Disable secrets scanning in UI, OR
2. Add environment variable: `SECRETS_SCAN_ENABLED=false`

---

## Update Backend CORS

After both sites are deployed, update Railway backend:

1. Go to Railway → Backend service
2. Update `CORS_ORIGIN` environment variable:
   ```
   http://localhost:3000,http://localhost:8081,http://localhost:8091,https://your-mobile.netlify.app,https://your-admin.netlify.app
   ```
3. Redeploy backend

---

## Verification Checklist

### Mobile App Site
- [ ] Base directory: `mobile`
- [ ] Build command: `npm run build:pwa`
- [ ] Publish directory: `mobile/dist`
- [ ] Environment variables set
- [ ] Deploys successfully
- [ ] Shows mobile app (NOT admin dashboard)
- [ ] Can navigate between screens
- [ ] PWA install prompt works

### Admin Dashboard Site
- [ ] Base directory: `admin-dashboard`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `admin-dashboard/build`
- [ ] SECRETS_SCAN_ENABLED=false set
- [ ] REACT_APP_API_URL set
- [ ] Secrets scanning disabled or configured
- [ ] Deploys successfully
- [ ] Shows admin dashboard (NOT mobile app)
- [ ] Can log in
- [ ] Dark mode toggle works

---

## Quick Reference

### Trigger Redeploy
1. Go to site on Netlify
2. **Deploys** tab
3. **Trigger deploy** → **Clear cache and deploy site**

### Check Build Logs
1. Go to site on Netlify
2. **Deploys** tab
3. Click on latest deploy
4. View logs for errors

### Update Settings
1. Go to site on Netlify
2. **Site settings** → **Build & deploy** → **Build settings**
3. Click **Edit settings**
4. Make changes
5. **Save**
6. Trigger new deploy

---

## Expected Deploy Times

- **Mobile App**: 2-4 minutes
- **Admin Dashboard**: 1-2 minutes

---

## Custom Domains (Optional)

### Mobile App
```
Domain: app.intentionalmovementcorporation.com
DNS: CNAME → your-mobile-site.netlify.app
```

### Admin Dashboard
```
Domain: admin.intentionalmovementcorporation.com
DNS: CNAME → your-admin-site.netlify.app
```

Configure in Netlify:
1. Site settings → Domain management → Add custom domain
2. Follow DNS configuration instructions
3. HTTPS certificate auto-generated

---

**Last Updated:** October 21, 2025
**Status:** Both sites should be configured in Netlify UI only (no netlify.toml files)
