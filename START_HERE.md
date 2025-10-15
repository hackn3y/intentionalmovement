# ⭐ START HERE - Deploy Your Backend

## 🎉 What's Already Done

Your app is **67% deployed**! Here's what's live:

1. ✅ **PWA (Mobile App):** https://mobile-8x3ghyvqu-ryan-hackneys-projects.vercel.app
2. ✅ **Admin Dashboard:** https://admin-dashboard-mnmzk2wr3-ryan-hackneys-projects.vercel.app

---

## 🚀 Deploy Backend Now (10 Minutes)

### Step 1: Open Railway
👉 **Click here:** https://railway.app
- Login with GitHub
- Click "Start a New Project"

### Step 2: Deploy from GitHub
- Select "Deploy from GitHub repo"
- Find: `hackn3y/intentionalmovement`
- Railway auto-detects backend

### Step 3: Add Database
- Click "+ New" button
- Select "Database" → "Add PostgreSQL"
- Done! (DATABASE_URL is auto-set)

### Step 4: Add Environment Variables
- Click on backend service
- Click "Variables" tab
- Open: `backend/.env.production`
- **Copy each line and paste into Railway** (one by one)

**Key variables to check:**
```
JWT_SECRET=6f2e671e5990f98f0f829e9c56dd775a4c2f171d8cb6df5d7150180ccd76ef3033db9990506d55ac78b9b0fcb398218b4113db091cc187d5309cdcd245043f82
CORS_ORIGIN=https://mobile-8x3ghyvqu-ryan-hackneys-projects.vercel.app,https://admin-dashboard-mnmzk2wr3-ryan-hackneys-projects.vercel.app
```

### Step 5: Deploy & Get URL
- Railway auto-deploys (wait 2-5 minutes)
- Click "Settings" → "Domains"
- **Copy your backend URL** (save this!)
  - Example: `https://backend-production-abc123.up.railway.app`

### Step 6: Run Migrations
- Settings → "Start Command"
- Change to: `npm run migrate && npm start`
- Click "Save" (triggers redeploy)

---

## ✅ After Backend Deploys

### Update PWA:
1. Go to: https://vercel.com/ryan-hackneys-projects/mobile/settings/environment-variables
2. Add variable:
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: `https://YOUR_RAILWAY_URL/api`
3. Save
4. Redeploy:
   ```bash
   cd mobile
   vercel --prod
   ```

### Update Admin:
1. Go to: https://vercel.com/ryan-hackneys-projects/admin-dashboard/settings/environment-variables
2. Add variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://YOUR_RAILWAY_URL/api`
3. Save
4. Redeploy:
   ```bash
   cd admin-dashboard
   vercel --prod
   ```

### Update Google OAuth:
1. Go to: https://console.cloud.google.com/apis/credentials?project=intentional-movement-corp
2. Click Web Client ID
3. Add redirect URI: `https://mobile-8x3ghyvqu-ryan-hackneys-projects.vercel.app`
4. Save (wait 5-10 minutes)

### Setup Stripe Webhooks:
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR_RAILWAY_URL/api/purchases/webhook`
3. Select all events
4. Copy webhook secret
5. Update in Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🧪 Test Everything

### Test Backend:
```bash
curl https://YOUR_RAILWAY_URL/health
```
Expected: `{"status":"ok"}`

### Test PWA:
- Visit: https://mobile-8x3ghyvqu-ryan-hackneys-projects.vercel.app
- Register account
- Login
- Create post

### Test Admin:
- Visit: https://admin-dashboard-mnmzk2wr3-ryan-hackneys-projects.vercel.app
- Login with admin credentials

---

## 📚 Need Help?

**Quick Reference:**
- `QUICK_DEPLOYMENT_STEPS.md` - Fast deployment guide
- `RAILWAY_DEPLOYMENT.md` - Detailed Railway guide
- `DEPLOYMENT_STATUS.md` - Current status
- `backend/.env.production` - All environment variables

**Stuck?** Read `RAILWAY_DEPLOYMENT.md` for troubleshooting.

---

## 🎯 That's It!

Follow these steps and your app will be **100% deployed** in ~15 minutes!

**Next:** Open https://railway.app and start Step 1 above ⬆️
