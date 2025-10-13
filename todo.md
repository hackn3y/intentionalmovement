# Intentional Movement Corp - TODO List

## 🔴 **CRITICAL BUGS (Fix Immediately)**

### Database Schema Issues
- [ ] **Fix Program Model Schema Mismatch** 🚨 **BLOCKING**
  - Issue: Database missing `instructorName` column causing API errors
  - Error: `SQLITE_ERROR: no such column: instructorName`
  - Impact: Programs endpoint returning 500 errors on mobile/admin
  - Solution: Run database migration to add missing column
  - File: `backend/src/models/Program.js` line 27-31
  - Command: `cd backend && npm run migrate`

### Backend Issues
- [ ] **Multiple Backend Instances Running**
  - Issue: Port 3001 already in use (multiple shells running)
  - Kill unnecessary background processes
  - Use: `tasklist | findstr node` then `taskkill /PID <pid> /F`

---

## 🔴 **Critical (Must Do Now)**

### Backend Configuration
- [x] ~~Generate Secure JWT Secret~~ ✓ **COMPLETED**
  - JWT secret has been generated: `92014ecb7aa9060611f77ea5912b4fe01df059c73fe7b0446049225d52fa5e14fb1a3e1e52c2e61be0cc7ed56244836db17c90d1b74489ec81c8275cfc277751`
  - File: `backend/.env` line 15

- [x] ~~Database Configuration Alignment~~ ✓ **PARTIALLY COMPLETED**
  - Using: SQLite (`database.sqlite`) for development ✅
  - PostgreSQL configured in .env for production reference ✅
  - Action: Keep current setup, document migration path to PostgreSQL

- [ ] **Admin Dashboard Security**
  - [x] ~~Remove public registration from admin UI~~ ✓ Completed
  - [x] ~~Add admin role check to PrivateRoute~~ ✓ Completed
  - [x] ~~Create make-admin.js script~~ ✓ Completed
  - [ ] Change default admin password from .env (currently: `Admin123!`)
    - Location: `backend/.env` line 56
    - Security risk if left as default

### Mobile App Setup
- [x] ~~Create Mobile App .env File~~ ✓ **COMPLETED**
  - File exists: `mobile/.env`
  - API_URL configured: `http://localhost:3001/api`
  - Stripe placeholder present

- [ ] **Test Mobile App Connection**
  - [x] ~~Start Expo~~ ✅ Running on port 8091
  - [x] ~~Verify API connection to backend~~ ✅ Connected
  - [ ] Fix Programs API error (see Critical Bugs above)
  - [ ] Test user registration and login
  - [ ] Test on physical device with IP address

---

## 🟡 **Important (Do Soon)**

### File Storage & Media
- [ ] **Configure File Upload System**
  - Current: AWS S3 credentials in .env are placeholders
  - Option 1: AWS S3 (production-ready)
    - [ ] Create AWS account and S3 bucket
    - [ ] Update `.env` lines 28-31 with real AWS credentials
    - [ ] Test profile image upload
  - Option 2: Local File Storage (development) **RECOMMENDED FOR DEV**
    - [ ] Create local uploads directory: `backend/uploads`
    - [ ] Configure multer for local storage in `backend/src/config/upload.js`
    - [ ] Add `uploads/` to .gitignore
    - [ ] Test file uploads locally
  - Option 3: Cloudinary (easier alternative)
    - [ ] Create Cloudinary account
    - [ ] Install cloudinary package: `npm install cloudinary`
    - [ ] Configure credentials

- [ ] **Video Hosting Configuration**
  - Current: Vimeo credentials are placeholders in .env
  - Option 1: Vimeo
    - [ ] Create Vimeo Pro account
    - [ ] Update `.env` lines 39-41 with Vimeo tokens
  - Option 2: Mux (recommended for streaming)
    - [ ] Create Mux account (mux.com)
    - [ ] Install: `npm install @mux/mux-node`
    - [ ] Configure credentials
  - Option 3: AWS S3 + CloudFront
    - [ ] Set up CloudFront distribution
    - [ ] Configure video streaming

### Payment Processing
- [ ] **Stripe Integration**
  - Current: Test keys are placeholders (`sk_test_your_stripe_secret_key`)
  - [ ] Create Stripe test account (stripe.com)
  - [ ] Get test API keys from dashboard
  - [ ] Update backend `.env` lines 34-36 with real test keys
  - [ ] Update mobile `.env` line 13 with publishable key
  - [ ] Test program purchase flow
  - [ ] Configure webhook endpoint
    - [ ] Set webhook URL in Stripe dashboard: `http://localhost:3001/api/webhooks/stripe`
    - [ ] Update STRIPE_WEBHOOK_SECRET in .env
  - [ ] Test subscription payments
  - [ ] Implement refund functionality

### Email Service
- [ ] **Configure Email Provider**
  - Current: SendGrid API key is placeholder in .env
  - Option 1: SendGrid (recommended)
    - [ ] Create SendGrid account
    - [ ] Get API key
    - [ ] Update `.env` lines 48-49
    - [ ] Verify sender email
  - Option 2: Mailgun (alternative)
    - [ ] Create Mailgun account
    - [ ] Configure credentials
  - Option 3: AWS SES (if using AWS)
    - [ ] Set up SES
    - [ ] Verify domain
  - [ ] Implement password reset email flow
  - [ ] Test email delivery
  - [ ] Create email templates

### Push Notifications
- [ ] **Firebase Cloud Messaging Setup**
  - Current: Firebase credentials are placeholders in .env
  - [ ] Create Firebase project (console.firebase.google.com)
  - [ ] Download service account JSON
  - [ ] Update backend `.env` lines 18-25 with Firebase config
  - [ ] Update mobile `.env` lines 17-22 with Firebase config
  - [ ] Configure FCM for mobile app
  - [ ] Test push notifications
  - [ ] Implement notification permissions in mobile app

---

## 🟢 **Nice to Have (Future)**

### Analytics & Monitoring
- [ ] **Analytics Integration**
  - Current: Mixpanel token is placeholder in .env
  - Option 1: Mixpanel
    - [ ] Create Mixpanel account
    - [ ] Update `.env` line 52
    - [ ] Implement event tracking
  - Option 2: Google Analytics
    - [ ] Set up GA4 property
    - [ ] Add tracking code
  - Option 3: Amplitude (alternative)
    - [ ] Create Amplitude account
    - [ ] Configure SDK

- [ ] **Error Monitoring**
  - [ ] Set up Sentry for error tracking
  - [ ] Configure Sentry DSN in .env
  - [ ] Test error reporting
  - [ ] Set up alerts
  - [ ] Configure logging with Winston (already installed)
  - [ ] Set up uptime monitoring

### Feature Implementation

#### Social Features
- [x] ~~Real-time Messaging~~ ✅ **PARTIALLY WORKING**
  - Socket.io connection working
  - Users connecting/disconnecting tracked
  - Messages being sent and received
  - [ ] Add typing indicators
  - [ ] Add read receipts
  - [ ] Add delivery confirmation
  - [ ] Test group messaging

- [x] ~~Social Feed~~ ✅ **WORKING**
  - Post creation working (3 posts seeded)
  - Likes and comments functional
  - Feed loading correctly
  - [ ] Implement post reporting
  - [ ] Add post sharing
  - [ ] Test infinite scroll
  - [ ] Add image upload to posts

- [x] ~~Follow System~~ ✅ **IMPLEMENTED**
  - Database models created
  - Follow/unfollow functionality exists
  - [ ] Test follow/unfollow in mobile app
  - [ ] Implement follower notifications
  - [ ] Create followers/following pages
  - [ ] Add activity feed

#### Gamification
- [ ] **Achievements System**
  - Backend: Models and controllers exist
  - Mobile: Screens implemented
  - [ ] Create achievement badges/icons
  - [ ] Implement achievement triggers
  - [ ] Test achievement unlocking
  - [ ] Add achievement notifications
  - [ ] Create achievements showcase page

- [ ] **Challenges**
  - Backend: Models and controllers exist
  - Mobile: Challenge screens implemented
  - [ ] Test challenge creation by admin
  - [ ] Verify participant enrollment
  - [ ] Implement leaderboard updates
  - [ ] Add challenge completion rewards
  - [ ] Test challenge notifications

#### E-Commerce
- [x] ~~Program Management~~ ✅ **IMPLEMENTED**
  - [x] ~~Fix program visibility for admins~~ ✓ Completed
  - [x] ~~Add delete program functionality~~ ✓ Completed
  - [ ] Fix database schema issue (see Critical Bugs)
  - [ ] Test program publishing workflow
  - [ ] Implement program categories filtering
  - [ ] Add program reviews/ratings
  - [ ] Create program preview feature

- [ ] **Subscriptions**
  - Backend: Models and controllers exist
  - [ ] Implement recurring subscription plans
  - [ ] Test subscription cancellation
  - [ ] Add subscription management page
  - [ ] Implement trial periods
  - [ ] Add subscription upgrade/downgrade

- [ ] **Progress Tracking**
  - Backend: Progress model exists
  - [ ] Implement workout completion tracking
  - [ ] Add progress charts
  - [ ] Create milestone notifications
  - [ ] Add workout history
  - [ ] Implement streak tracking

### Admin Dashboard Enhancements
- [ ] **Content Moderation**
  - Backend: Report model exists
  - [ ] Complete moderation queue implementation
  - [ ] Add bulk moderation actions
  - [ ] Implement auto-moderation rules
  - [ ] Test report review workflow
  - [ ] Add moderation history

- [ ] **Analytics Dashboard**
  - Current: Basic stats implemented
  - [ ] Add revenue charts
  - [ ] Implement user growth graphs
  - [ ] Add engagement metrics
  - [ ] Create export functionality
  - [ ] Add date range filters
  - [ ] Connect to real data sources

- [x] ~~User Management~~ ✅ **PARTIALLY COMPLETED**
  - [x] ~~Implement ban/unban functionality~~ ✓ Completed
  - [x] ~~Add user search~~ ✓ Working in mobile
  - [ ] Add user search/filter in admin dashboard
  - [ ] Implement bulk user actions
  - [ ] Add user activity logs
  - [ ] Create user segmentation

---

## 🔧 **Development & Testing**

### Code Quality
- [ ] **Testing**
  - Backend: Jest installed and configured
  - Mobile: Jest installed
  - [ ] Write unit tests for backend controllers
  - [ ] Add integration tests for API endpoints
  - [ ] Implement E2E tests for critical flows
  - [ ] Test mobile app components
  - [ ] Add test coverage reporting
  - [ ] Set up CI/CD pipeline for tests

- [ ] **Code Review**
  - Backend: ESLint configured
  - Mobile: ESLint configured
  - [ ] Set up consistent ESLint rules across workspaces
  - [ ] Configure Prettier
  - [ ] Add pre-commit hooks (Husky)
  - [ ] Review error handling across app
  - [ ] Audit security vulnerabilities
  - [ ] Run `npm audit` and fix issues

### Documentation
- [ ] **API Documentation**
  - [ ] Generate Swagger/OpenAPI docs
  - [ ] Document all endpoints
  - [ ] Add request/response examples
  - [ ] Create Postman collection
  - [ ] Add authentication guide

- [x] ~~Developer Docs~~ ✅ **COMPLETED**
  - [x] ~~Create CLAUDE.md project guide~~ ✓ Completed
  - [x] ~~Update README.md~~ ✓ Completed
  - [ ] Add architecture diagrams
  - [ ] Document database schema with ERD
  - [ ] Create deployment guide
  - [ ] Add troubleshooting guide
  - [ ] Document environment variables

### Performance
- [ ] **Optimization**
  - [ ] Implement database indexing (partially done)
  - [ ] Add query optimization
  - [ ] Set up caching (Redis)
  - [ ] Optimize image loading
  - [ ] Implement lazy loading in mobile
  - [ ] Add CDN for static assets
  - [ ] Profile and optimize slow queries

---

## 🚀 **Production Deployment**

### Infrastructure Setup
- [ ] **Database Migration**
  - Current: Using SQLite in development
  - [ ] Set up production PostgreSQL database (e.g., Heroku Postgres, AWS RDS)
  - [ ] Create production database
  - [ ] Update production .env with PostgreSQL connection string
  - [ ] Run production migrations
  - [ ] Import/migrate SQLite data if needed
  - [ ] Configure automated database backups
  - [ ] Set up replication (optional)

- [ ] **Environment Configuration**
  - [ ] Create production .env file (DO NOT commit)
  - [ ] Set NODE_ENV=production
  - [ ] Configure production URLs
  - [ ] Set secure session secrets
  - [ ] Enable HTTPS/SSL
  - [ ] Update CORS origins for production domains

- [ ] **Hosting**
  - Backend Options:
    - [ ] AWS EC2 / Elastic Beanstalk
    - [ ] Google Cloud Run
    - [ ] Heroku (easiest for initial deployment)
    - [ ] DigitalOcean App Platform
    - [ ] Railway.app
  - Admin Dashboard:
    - [ ] Vercel (recommended - free tier)
    - [ ] Netlify
    - [ ] AWS S3 + CloudFront
    - [ ] Build: `cd admin-dashboard && npm run build`
  - Mobile App:
    - [ ] Submit to Apple App Store (requires Apple Developer account $99/yr)
    - [ ] Submit to Google Play Store (one-time $25 fee)
    - [ ] Set up over-the-air updates (Expo EAS)
    - [ ] Configure app signing
    - [ ] Create app store listings

### Security Hardening
- [ ] **Security Checklist**
  - [x] ~~Enable rate limiting~~ ✅ Implemented (100 requests per 15 min)
  - [x] ~~Configure CORS properly~~ ✅ Configured
  - [ ] Add comprehensive request validation
  - [ ] Implement SQL injection prevention (Sequelize provides this)
  - [ ] Add XSS protection
  - [ ] Configure CSP headers
  - [ ] Set up DDoS protection (Cloudflare)
  - [ ] Enable audit logging
  - [ ] Implement 2FA for admin accounts
  - [ ] Regular security audits
  - [ ] Keep dependencies updated
  - [ ] Use security headers (Helmet.js already installed)

### Monitoring & Maintenance
- [ ] **Production Monitoring**
  - [ ] Set up application monitoring (New Relic/Datadog)
  - [ ] Configure error tracking (Sentry)
  - [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Add performance monitoring
  - [ ] Configure alert notifications
  - [ ] Set up log aggregation (LogDNA, Papertrail)
  - [ ] Monitor database performance

- [ ] **Backup & Recovery**
  - [ ] Implement automated database backups (daily)
  - [ ] Test backup restoration
  - [ ] Document recovery procedures
  - [ ] Set up disaster recovery plan
  - [ ] Store backups off-site
  - [ ] Implement point-in-time recovery

---

## 📝 **Completed Tasks**

### Admin Dashboard
- [x] Fix program visibility issue (show unpublished programs to admins)
- [x] Add delete program functionality with confirmation
- [x] Fix placeholder image errors (use gradient fallbacks)
- [x] Change login page to light pink theme
- [x] Remove public registration from admin UI
- [x] Add admin role verification in PrivateRoute
- [x] Create Unauthorized access page
- [x] Create make-admin.js utility script
- [x] Add dark mode support
- [x] Implement burgundy/maroon theme with Cinzel/Arimo fonts
- [x] Add user ban/unban functionality

### Backend
- [x] Create adminController with getPrograms for admins
- [x] Update admin routes to use adminController
- [x] Add ban-related fields to User model
- [x] Create database migration for ban columns
- [x] Set up Sequelize with SQLite
- [x] Implement all core models (User, Post, Program, etc.)
- [x] Set up Socket.io for real-time features
- [x] Configure rate limiting
- [x] Set up Winston logging
- [x] Install and configure Stripe SDK
- [x] Install and configure AWS SDK
- [x] Generate secure JWT secret

### Mobile App
- [x] Create mobile .env file with API configuration
- [x] Set up Redux store with slices
- [x] Implement navigation structure
- [x] Create UI components (PostCard, ProgramCard, etc.)
- [x] Set up Socket.io client
- [x] Install Stripe React Native SDK
- [x] Create authentication screens
- [x] Implement social feed screens
- [x] Create messaging screens
- [x] Set up Expo configuration

---

## 🎯 **Quick Wins (Do These First)**

1. [x] ~~Generate secure JWT secret (5 min)~~ ✅ **DONE**
2. [x] ~~Create mobile/.env file (5 min)~~ ✅ **DONE**
3. [ ] **Fix Program database schema bug (10 min)** 🚨 **DO THIS NOW**
4. [ ] Kill duplicate backend processes (2 min)
5. [ ] Set up local file storage for dev (15 min)
6. [ ] Create Stripe test account (10 min)
7. [ ] Test program purchase flow (30 min)
8. [ ] Change default admin password (2 min)

---

## 📊 **Progress Tracking**

**Phase 1: Core Functionality** - 🟡 **75% Complete**
- Backend API: ✅ Running (with 1 schema bug)
- Admin Dashboard: ✅ Functional
- Mobile App: ✅ Running on web port 8091
- Authentication: ✅ Working
- File Storage: ❌ Not configured
- Database: ✅ SQLite working (needs schema fix)

**Phase 2: Payment & Commerce** - 🟡 **40% Complete**
- Stripe Integration: 🟡 SDK installed, needs configuration
- Program Purchases: 🟡 Backend ready, needs testing
- Subscriptions: 🟡 Backend ready, needs testing

**Phase 3: Media & Storage** - 🔴 **0% Complete**
- File Uploads: ❌ Not configured
- Video Hosting: ❌ Not configured
- Image Optimization: ❌ Not implemented

**Phase 4: Communication** - 🟢 **60% Complete**
- Email Service: ❌ Not configured
- Push Notifications: ❌ Not configured
- Real-time Messaging: ✅ Working via Socket.io

**Phase 5: Production Ready** - 🔴 **0% Complete**
- Production Database: ❌ PostgreSQL not set up
- Deployment: ❌ Not deployed
- Security Hardening: 🟡 Basic security in place
- Monitoring: ❌ Not configured

---

## 🐛 **Known Issues**

1. **Program API Error** 🚨
   - Error: `SQLITE_ERROR: no such column: instructorName`
   - Cause: Database schema out of sync with model
   - Impact: Programs page not loading in mobile app
   - Fix: Run `npm run migrate` in backend directory

2. **Multiple Backend Instances**
   - Multiple node processes listening on port 3001
   - Causing address already in use errors
   - Fix: Kill old processes with `taskkill`

3. **Placeholder Credentials**
   - AWS S3: Using placeholder credentials
   - Stripe: Using placeholder test keys
   - Firebase: Using placeholder credentials
   - Vimeo: Using placeholder credentials
   - SendGrid: Using placeholder API key
   - Mixpanel: Using placeholder token
   - Impact: External integrations won't work until configured

4. **Default Admin Password**
   - Still using default password: `Admin123!`
   - Security risk for production
   - Fix: Change in backend/.env and update database

---

## 🔗 **Useful Links & Resources**

### Development Servers
- Backend API: http://localhost:3001
- Admin Dashboard: http://localhost:3000 (if running)
- Mobile Web: http://localhost:8091 ✅ Currently running
- API Health Check: http://localhost:3001/health

### External Services to Set Up
- [Stripe Dashboard](https://dashboard.stripe.com) - Payment processing
- [Firebase Console](https://console.firebase.google.com) - Push notifications
- [AWS Console](https://console.aws.amazon.com) - File storage
- [Vimeo API](https://developer.vimeo.com) - Video hosting
- [SendGrid](https://app.sendgrid.com) - Email service
- [Cloudinary](https://cloudinary.com) - Alternative image hosting
- [Mux](https://dashboard.mux.com) - Alternative video hosting

### Documentation
- [Sequelize ORM Docs](https://sequelize.org/docs/v6/) - Database ORM
- [Expo Docs](https://docs.expo.dev) - Mobile framework
- [React Native Docs](https://reactnative.dev/docs/getting-started) - Mobile development
- [Stripe Docs](https://stripe.com/docs) - Payment integration
- [Socket.io Docs](https://socket.io/docs/v4/) - Real-time features
- [Redux Toolkit Docs](https://redux-toolkit.js.org/) - State management

### Project Files
- Backend .env: `backend/.env`
- Mobile .env: `mobile/.env`
- Admin .env: `admin-dashboard/.env`
- Database: `backend/database.sqlite`

---

**Last Updated:** October 13, 2025
**Maintained By:** Development Team
**Current Status:** Development Phase - Core functionality working with 1 critical bug

**Next Steps:**
1. Fix Program database schema bug
2. Clean up background processes
3. Configure Stripe test account
4. Set up local file storage
5. Test full mobile app functionality
