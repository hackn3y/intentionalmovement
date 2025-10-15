# Deployment Guide

Complete guide for deploying Intentional Movement Corp to production.

## Overview

This monorepo contains three deployable applications:
1. **PWA (Mobile App)** - Deploy to Vercel
2. **Backend API** - Deploy to Railway
3. **Admin Dashboard** - Deploy to Vercel

---

## 1. PWA Deployment (Vercel)

### Prerequisites
- Vercel account: https://vercel.com
- Vercel CLI installed: `npm install -g vercel`

### Steps

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Build the PWA:**
   ```bash
   npm run build:pwa
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard:**
   - `EXPO_PUBLIC_API_URL` - Your backend URL (e.g., `https://api.yourapp.com/api`)
   - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Google OAuth Web Client ID
   - `EXPO_PUBLIC_MIXPANEL_TOKEN` - Mixpanel analytics token

5. **Update Google OAuth Redirect URIs:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add your Vercel domain to authorized redirect URIs
   - Wait 5-10 minutes for changes to propagate

### Vercel Configuration

The PWA uses `mobile/vercel.json`:
- Single Page Application (SPA) routing
- Service Worker caching headers
- Security headers (X-Frame-Options, CSP, etc.)

---

## 2. Backend Deployment (Railway)

### Prerequisites
- Railway account: https://railway.app
- Railway CLI installed: `npm install -g @railway/cli`

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Create new project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL database:**
   ```bash
   railway add
   # Select "PostgreSQL"
   ```

5. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your_jwt_secret_here
   railway variables set STRIPE_SECRET_KEY=your_stripe_secret_key
   railway variables set STRIPE_WEBHOOK_SECRET=your_webhook_secret
   railway variables set AWS_ACCESS_KEY_ID=your_aws_key
   railway variables set AWS_SECRET_ACCESS_KEY=your_aws_secret
   railway variables set AWS_S3_BUCKET=your_bucket_name
   railway variables set AWS_REGION=us-east-2
   railway variables set SENDGRID_API_KEY=your_sendgrid_key
   railway variables set FROM_EMAIL=your_email
   railway variables set CORS_ORIGIN=https://yourapp.com,https://admin.yourapp.com
   ```

6. **Add Firebase Service Account:**
   - Upload `firebase-service-account.json` as environment variable:
   ```bash
   railway variables set FIREBASE_SERVICE_ACCOUNT="$(cat firebase-service-account.json)"
   ```

7. **Deploy:**
   ```bash
   railway up
   ```

8. **Run migrations:**
   ```bash
   railway run npm run migrate
   ```

9. **Seed database (optional):**
   ```bash
   railway run npm run seed
   ```

### Railway Configuration

The backend uses `backend/railway.json`:
- Nixpacks builder (auto-detects Node.js)
- Auto-restart on failure
- PostgreSQL database linked

### Database Setup

Railway provides PostgreSQL database with connection string. The backend will automatically use `DATABASE_URL` environment variable.

---

## 3. Admin Dashboard Deployment (Vercel)

### Prerequisites
- Vercel account: https://vercel.com
- Vercel CLI installed: `npm install -g vercel`

### Steps

1. **Navigate to admin directory:**
   ```bash
   cd admin-dashboard
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard:**
   - `REACT_APP_API_URL` - Your backend URL (e.g., `https://api.yourapp.com/api`)

### Vercel Configuration

The admin dashboard uses `admin-dashboard/vercel.json`:
- Create React App framework detection
- SPA routing
- Security headers

---

## 4. Environment Variables Summary

### PWA (Mobile) - Vercel
```bash
EXPO_PUBLIC_API_URL=https://api.yourapp.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Backend - Railway
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://... (auto-provided by Railway)
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
STORAGE_MODE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
AWS_S3_BUCKET=your-bucket-name

# Firebase
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Intentional Movement Corp

# Video
VIDEO_SERVICE=mux
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret

# Analytics
MIXPANEL_TOKEN=your_mixpanel_token

# CORS
CORS_ORIGIN=https://yourapp.com,https://admin.yourapp.com

# Admin
ADMIN_EMAIL=admin@yourapp.com
ADMIN_PASSWORD=secure_password_here
```

### Admin Dashboard - Vercel
```bash
REACT_APP_API_URL=https://api.yourapp.com/api
```

---

## 5. Post-Deployment Checklist

### PWA
- [ ] Verify app loads at production URL
- [ ] Test login/registration
- [ ] Test Google Sign-In (check redirect URIs)
- [ ] Test Stripe payments
- [ ] Test offline functionality
- [ ] Run Lighthouse audit (should score 90+ PWA)
- [ ] Test "Add to Home Screen" functionality
- [ ] Verify service worker is registered

### Backend
- [ ] Health check endpoint responds: `GET https://api.yourapp.com/health`
- [ ] Database migrations completed
- [ ] Test authentication endpoints
- [ ] Test file uploads (AWS S3)
- [ ] Configure Stripe webhooks
- [ ] Test email sending
- [ ] Monitor logs for errors
- [ ] Set up SSL certificate (Railway provides this)

### Admin Dashboard
- [ ] Verify dashboard loads
- [ ] Test admin login
- [ ] Test user management
- [ ] Test analytics display
- [ ] Verify API connection

---

## 6. DNS Configuration

### Custom Domain Setup

1. **PWA (Mobile App):**
   - Domain: `app.yourapp.com`
   - Point A record to Vercel: `76.76.21.21`
   - Or use CNAME: `cname.vercel-dns.com`

2. **Backend API:**
   - Domain: `api.yourapp.com`
   - Railway provides custom domain support
   - Add CNAME record to Railway's DNS

3. **Admin Dashboard:**
   - Domain: `admin.yourapp.com`
   - Point A record to Vercel: `76.76.21.21`
   - Or use CNAME: `cname.vercel-dns.com`

---

## 7. Stripe Webhook Configuration

After deploying the backend:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://api.yourapp.com/api/purchases/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to Railway environment variables: `STRIPE_WEBHOOK_SECRET`

---

## 8. Monitoring & Logging

### Vercel
- Automatic deployment logs
- Runtime logs in Vercel dashboard
- Analytics available in pro plan

### Railway
- Real-time logs in Railway dashboard
- Database metrics
- CPU/Memory usage monitoring

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Mixpanel** - Analytics (already configured)
- **Uptime Robot** - Uptime monitoring

---

## 9. Security Checklist

- [ ] All environment variables stored securely
- [ ] HTTPS enabled on all domains
- [ ] CORS configured for production domains only
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Sequelize ORM)
- [ ] XSS protection headers configured
- [ ] CSP headers configured
- [ ] Stripe webhook signature verification
- [ ] Firebase service account secured

---

## 10. Rollback Plan

### PWA & Admin Dashboard (Vercel)
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Backend (Railway)
- Railway keeps deployment history
- Rollback via Railway dashboard
- Or redeploy from specific Git commit

---

## 11. Common Issues

### Issue: CORS errors in production
**Fix:** Update `CORS_ORIGIN` in backend environment variables to include production URLs

### Issue: Google Sign-In not working
**Fix:** Add production domain to Google Cloud Console authorized redirect URIs

### Issue: Stripe webhooks failing
**Fix:** Verify webhook secret matches Stripe dashboard

### Issue: Database connection errors
**Fix:** Check `DATABASE_URL` is correctly set by Railway

### Issue: File uploads failing
**Fix:** Verify AWS S3 credentials and bucket permissions

---

## 12. Cost Estimates

### Vercel (PWA + Admin)
- **Free tier:** 100GB bandwidth/month
- **Pro tier:** $20/month - Unlimited bandwidth, better performance

### Railway (Backend + Database)
- **Free tier:** $5 credit/month
- **Hobby tier:** ~$5-20/month depending on usage
- **Database:** Included in plan

### AWS S3 (File Storage)
- **Free tier:** 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **After free tier:** ~$0.023/GB/month + request costs

### Stripe
- **Processing fees:** 2.9% + $0.30 per transaction

### SendGrid (Email)
- **Free tier:** 100 emails/day
- **Essentials:** $19.95/month - 50,000 emails

### Total Estimated Monthly Cost:
- **Minimal usage:** ~$0-10/month (free tiers)
- **Growing app:** ~$50-100/month
- **Established app:** ~$200-500/month

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Stripe Docs:** https://stripe.com/docs
- **Firebase Docs:** https://firebase.google.com/docs

---

**Last Updated:** October 14, 2025
**Status:** Ready for production deployment
