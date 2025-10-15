# Production Deployment Guide

This guide covers everything needed to deploy Intentional Movement Corp to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment Tasks](#post-deployment-tasks)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Required Tasks Before Deployment

- [ ] **Database Migration System**: Currently using `sequelize.sync()` - needs proper migrations
- [ ] **Environment Variables**: All production secrets configured
- [ ] **Stripe Products**: Created in Stripe Dashboard with price IDs
- [ ] **Domain & SSL**: Domain purchased and SSL certificate configured
- [ ] **Error Monitoring**: Sentry or similar service configured
- [ ] **Analytics**: Mixpanel configured (optional but recommended)
- [ ] **Email Service**: SendGrid or Mailgun configured
- [ ] **File Storage**: AWS S3 buckets created and configured
- [ ] **Video Hosting**: Vimeo account configured
- [ ] **Push Notifications**: Firebase project configured
- [ ] **App Icons**: All PWA icons generated (72x72 to 512x512)
- [ ] **Legal Review**: Terms of Service and Privacy Policy reviewed by legal counsel
- [ ] **Performance Testing**: Load testing completed
- [ ] **Security Audit**: Security review completed

### ✅ Completed Features

- [x] Subscription system with tier-based access
- [x] Stripe integration (backend)
- [x] Terms of Service page
- [x] Privacy Policy page (GDPR/CCPA compliant)
- [x] PWA configuration (manifest, meta tags, service worker)
- [x] Mobile subscription UI
- [x] Upgrade prompts and banners
- [x] Legal page navigation

---

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
APP_URL=https://api.intentionalmovement.com

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/database
# OR individual connection params
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=intentional_movement_prod
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_DIALECT=postgres

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
JWT_EXPIRES_IN=7d

# CORS Origins
CORS_ORIGIN=https://intentionalmovement.com,https://app.intentionalmovement.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_BASIC_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

# Firebase (Authentication & Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=intentional-movement-uploads

# Vimeo (Video Hosting)
VIMEO_ACCESS_TOKEN=your-vimeo-access-token
VIMEO_CLIENT_ID=your-vimeo-client-id
VIMEO_CLIENT_SECRET=your-vimeo-client-secret

# Email Service
SENDGRID_API_KEY=SG....
# OR
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.intentionalmovement.com

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token

# Error Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Mobile Environment Variables

Create a `.env` file in the `mobile/` directory:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.intentionalmovement.com
EXPO_PUBLIC_SOCKET_URL=https://api.intentionalmovement.com

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Firebase
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# App Configuration
APP_NAME=Intentional Movement
APP_VERSION=1.0.0
ENVIRONMENT=production
```

---

## Database Configuration

### 1. PostgreSQL Setup

**Option A: Managed Service (Recommended)**

Use a managed PostgreSQL service:
- **Neon** (Free tier: https://neon.tech)
- **Supabase** (Free tier: https://supabase.com)
- **AWS RDS** (Paid: https://aws.amazon.com/rds/)
- **Railway** (Free trial: https://railway.app)
- **Heroku Postgres** (Paid: https://www.heroku.com/postgres)

**Option B: Self-Hosted**

Install PostgreSQL on your server:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE intentional_movement_prod;
CREATE USER your_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE intentional_movement_prod TO your_user;
\q
```

### 2. Create Database Migration System

**IMPORTANT**: Replace `sequelize.sync()` with proper migrations before production.

Install Sequelize CLI:

```bash
cd backend
npm install --save-dev sequelize-cli
```

Initialize migrations:

```bash
npx sequelize-cli init
```

Create initial migration:

```bash
npx sequelize-cli migration:generate --name create-initial-schema
```

Run migrations in production:

```bash
# Set NODE_ENV=production
npx sequelize-cli db:migrate
```

### 3. Seed Initial Data (Optional)

```bash
npx sequelize-cli seed:generate --name seed-initial-data
npx sequelize-cli db:seed:all
```

---

## Stripe Configuration

### 1. Create Products in Stripe Dashboard

Follow the guide in `docs/STRIPE_SETUP.md`.

**Products to Create:**
1. **Basic Monthly** - $9.99/month
2. **Basic Yearly** - $99.99/year (save $20)
3. **Premium Monthly** - $29.99/month
4. **Premium Yearly** - $299.99/year (save $60)

### 2. Configure Webhooks

Set up webhook endpoint in Stripe Dashboard:

**Webhook URL**: `https://api.intentionalmovement.com/api/subscriptions/webhook`

**Events to Subscribe:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

### 3. Test Stripe Integration

Use Stripe test mode before going live:

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/subscriptions/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## Deployment Options

### Option 1: Railway (Recommended for Quick Start)

**Pros**: Free tier, easy setup, PostgreSQL included
**Cons**: Limited free tier, costs scale with usage

**Deploy Backend:**

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure environment variables in Railway dashboard
5. Railway auto-detects Node.js and deploys

**Deploy Mobile (Web):**

1. Build the Expo web app:
   ```bash
   cd mobile
   npm run build:web
   ```
2. Deploy the `web-build` folder to Railway or use Vercel (see Option 2)

### Option 2: Vercel + Neon (Best Free Option)

**Backend on Railway/Render, Frontend on Vercel**

**Deploy Backend (Railway/Render):**
- Follow Option 1 for backend

**Deploy Mobile Web (Vercel):**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Build and deploy:
   ```bash
   cd mobile
   npm run build:web
   cd web-build
   vercel
   ```

3. Configure Vercel:
   - Add environment variables in Vercel dashboard
   - Set custom domain

**Database (Neon):**
- Create free PostgreSQL database at https://neon.tech
- Copy connection string to `DATABASE_URL`

### Option 3: AWS (Full Control, Higher Cost)

**Services Needed:**
- **EC2** or **ECS**: For backend Node.js app
- **RDS PostgreSQL**: For database
- **S3**: For file storage (already configured)
- **CloudFront**: For CDN
- **Route 53**: For DNS
- **Certificate Manager**: For SSL

**Estimated Monthly Cost**: $50-100 for basic setup

### Option 4: DigitalOcean (Good Balance)

**Services:**
- **Droplet** ($6/month): For backend
- **Managed PostgreSQL** ($15/month): For database
- **Spaces** ($5/month): For file storage

**Total**: ~$26/month

**Setup:**

1. Create Droplet (Ubuntu 22.04)
2. SSH into droplet
3. Install Node.js, PM2, Nginx
4. Clone repository
5. Configure Nginx reverse proxy
6. Set up SSL with Let's Encrypt
7. Use PM2 for process management

---

## Post-Deployment Tasks

### 1. Verify Deployment

Test all critical paths:

```bash
# Health check
curl https://api.intentionalmovement.com/health

# Test authentication
curl -X POST https://api.intentionalmovement.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Test subscription endpoint
curl https://api.intentionalmovement.com/api/subscriptions/plans
```

### 2. Configure DNS

Point your domain to your servers:

```
A Record:    api.intentionalmovement.com    →  YOUR_BACKEND_IP
A Record:    intentionalmovement.com        →  YOUR_FRONTEND_IP
CNAME:       www.intentionalmovement.com    →  intentionalmovement.com
```

### 3. Set Up SSL/HTTPS

**Option A: Let's Encrypt (Free)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d intentionalmovement.com -d www.intentionalmovement.com
```

**Option B: Cloudflare (Free)**
- Add site to Cloudflare
- Update nameservers
- Enable SSL/TLS

### 4. Configure Monitoring

**Uptime Monitoring:**
- UptimeRobot (free): https://uptimerobot.com
- Pingdom
- StatusCake

**Error Monitoring:**
- Sentry (free tier): https://sentry.io
- LogRocket
- Rollbar

**Performance Monitoring:**
- New Relic
- DataDog
- AppDynamics

### 5. Set Up Backups

**Database Backups:**

```bash
# Daily backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

**Automated Backups:**
- Most managed databases include automatic backups
- Configure retention policy (7-30 days)

### 6. Mobile App Deployment

**iOS App Store:**

1. Create Apple Developer account ($99/year)
2. Build iOS app:
   ```bash
   cd mobile
   eas build --platform ios
   ```
3. Submit to App Store Connect
4. Wait for review (1-3 days)

**Google Play Store:**

1. Create Google Play Console account ($25 one-time)
2. Build Android app:
   ```bash
   cd mobile
   eas build --platform android
   ```
3. Upload to Play Console
4. Submit for review (faster than iOS)

**Progressive Web App:**
- Already configured! Just deploy web build
- Users can "Add to Home Screen" on mobile

---

## Monitoring & Maintenance

### Daily Tasks

- [ ] Check error monitoring dashboard (Sentry)
- [ ] Review server resource usage
- [ ] Monitor API response times
- [ ] Check database performance

### Weekly Tasks

- [ ] Review user analytics (Mixpanel)
- [ ] Check Stripe transactions and revenue
- [ ] Review server logs for issues
- [ ] Test critical user flows
- [ ] Database optimization (if needed)

### Monthly Tasks

- [ ] Security updates (`npm audit fix`)
- [ ] Dependency updates
- [ ] Backup verification
- [ ] Cost analysis and optimization
- [ ] Performance optimization
- [ ] User feedback review

### Key Metrics to Track

**Technical:**
- API response time (target: < 500ms)
- Error rate (target: < 1%)
- Uptime (target: 99.9%)
- Database query time
- Server CPU/Memory usage

**Business:**
- New user signups
- Free → Paid conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Active users (DAU/MAU)

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**

```bash
# Check connection
psql $DATABASE_URL

# Verify credentials
echo $DATABASE_URL

# Check firewall/security groups
# Ensure backend IP is whitelisted
```

**2. Stripe Webhook Failures**

```bash
# Check webhook logs in Stripe Dashboard
# Verify webhook secret matches .env
# Test webhook endpoint:
curl -X POST https://api.intentionalmovement.com/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

**3. CORS Errors**

Check `CORS_ORIGIN` in backend `.env`:
```bash
CORS_ORIGIN=https://intentionalmovement.com,https://www.intentionalmovement.com,https://app.intentionalmovement.com
```

**4. High Memory Usage**

```bash
# Check Node.js processes
pm2 status
pm2 monit

# Restart if needed
pm2 restart all

# Increase Node.js memory limit
node --max-old-space-size=4096 src/server.js
```

**5. SSL Certificate Issues**

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### Emergency Procedures

**Database Corruption:**
1. Stop backend server
2. Restore from latest backup
3. Verify data integrity
4. Restart server

**Server Down:**
1. Check server status/logs
2. Restart with PM2: `pm2 restart all`
3. If still down, check error logs
4. Consider rollback to previous version

**Security Breach:**
1. Immediately rotate all secrets (JWT_SECRET, API keys)
2. Force logout all users
3. Review audit logs
4. Notify affected users if data exposed

---

## Performance Optimization

### Backend Optimization

**1. Add Redis Caching:**

```bash
npm install redis
```

```javascript
// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache subscription plans
async function getPlans() {
  const cached = await client.get('plans');
  if (cached) return JSON.parse(cached);

  const plans = await fetchPlansFromDB();
  await client.setEx('plans', 3600, JSON.stringify(plans));
  return plans;
}
```

**2. Database Indexing:**

Ensure all foreign keys and frequently queried fields are indexed.

**3. Rate Limiting:**

Already configured but consider per-user limits:

```javascript
// Implement per-user rate limiting
const rateLimit = require('express-rate-limit');

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip
});
```

**4. Database Connection Pooling:**

Configure in Sequelize:

```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});
```

### Frontend Optimization

**1. Code Splitting:**
Already handled by Expo/React Native

**2. Image Optimization:**
- Use WebP format
- Implement lazy loading
- Use CDN for images

**3. Bundle Size:**

```bash
# Analyze bundle
npx expo-bundle-visualizer

# Remove unused dependencies
npm prune
```

---

## Security Checklist

- [ ] HTTPS enforced on all endpoints
- [ ] JWT secrets are strong (>32 characters)
- [ ] Database credentials are secure
- [ ] API keys are not committed to Git
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Sequelize)
- [ ] XSS prevention (React handles this)
- [ ] CSRF tokens for sensitive operations
- [ ] Helmet.js configured for security headers
- [ ] Regular security audits (`npm audit`)
- [ ] User passwords hashed with bcrypt
- [ ] Sensitive data encrypted at rest

---

## Cost Estimates

### Minimal Setup (Free Tier)

- **Backend**: Railway (Free tier)
- **Database**: Neon (Free tier)
- **Frontend**: Vercel (Free tier)
- **File Storage**: AWS S3 (Pay per use, ~$1/month)
- **Total**: ~$1-5/month

### Recommended Production Setup

- **Backend**: DigitalOcean Droplet ($12/month)
- **Database**: DigitalOcean Managed PostgreSQL ($15/month)
- **Storage**: DigitalOcean Spaces ($5/month)
- **CDN**: Cloudflare (Free)
- **Email**: SendGrid (Free tier: 100 emails/day)
- **Monitoring**: Sentry (Free tier)
- **Total**: ~$32/month

### Scale-Ready Setup

- **Backend**: AWS ECS ($50-100/month)
- **Database**: AWS RDS ($50-100/month)
- **Storage**: AWS S3 ($10-20/month)
- **CDN**: CloudFront ($10-30/month)
- **Other Services**: $20-40/month
- **Total**: ~$140-290/month

---

## Launch Checklist

### Week Before Launch

- [ ] Complete all security audits
- [ ] Load testing completed
- [ ] All environment variables configured
- [ ] Stripe in live mode with test transactions
- [ ] Database migrations tested
- [ ] Backup system tested and verified
- [ ] Monitoring systems active
- [ ] Error tracking configured
- [ ] SSL certificates installed
- [ ] DNS configured
- [ ] Email templates tested
- [ ] Push notifications tested
- [ ] Legal documents reviewed
- [ ] Privacy policy updated
- [ ] Terms of service updated

### Launch Day

- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Verify all endpoints working
- [ ] Test complete user flow (signup → subscription → program purchase)
- [ ] Monitor error rates
- [ ] Check server performance
- [ ] Announce launch
- [ ] Monitor user feedback

### Post-Launch (First Week)

- [ ] Daily error monitoring
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Bug fixes prioritization
- [ ] Analytics review
- [ ] Server resource optimization

---

## Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Expo Deployment**: https://docs.expo.dev/distribution/introduction/
- **PostgreSQL Best Practices**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Node.js Production Practices**: https://nodejs.org/en/docs/guides/
- **Security Best Practices**: https://cheatsheetseries.owasp.org/

---

## Support & Maintenance

For ongoing support:
- Document all issues in GitHub Issues
- Create runbooks for common procedures
- Maintain changelog for all deployments
- Keep team documentation updated

**Emergency Contacts:**
- DevOps: [Contact information]
- Database Admin: [Contact information]
- Security Team: [Contact information]

---

*Last Updated: October 13, 2025*
*Version: 1.0.0*
