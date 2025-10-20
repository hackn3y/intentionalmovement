# Railway Database Migration Instructions

## ⚠️ CRITICAL: Run Force Sync on Railway PostgreSQL

### Problem
Your Railway PostgreSQL database needs to be force-synced to create all tables. When you ran `railway run node force-sync-db-auto.js` locally, it synchronized your **local SQLite database**, not Railway's PostgreSQL database.

### You Need To:
Run the force-sync script **inside Railway's production environment** so it connects to the actual PostgreSQL database.

## Method 1: Railway Dashboard - One-Off Command (Easiest)

1. Go to https://railway.app/dashboard
2. Select project: **disciplined-beauty**
3. Click on your **backend service** (Node.js app, not Postgres)
4. Look for **"Run Command"** or **"One-Off Command"** (location varies by Railway version):
   - May be in **Settings** tab
   - Or in **Deployments** → Latest deployment → Shell/Command interface
5. Run:
   ```bash
   npm run force:sync:auto
   ```
6. Wait for success message showing 20 tables created
7. **Restart the backend service**

## Method 2: Temporarily Change Start Command

1. Railway dashboard → Backend service → **Settings**
2. Find **"Start Command"**
3. Change from `npm start` to:
   ```bash
   npm run force:sync:auto && npm start
   ```
4. Save and let Railway redeploy
5. Check logs for "SUCCESS: Database has been reset"
6. **IMPORTANT**: Change start command back to `npm start` after successful sync

## Method 3: Railway CLI (if you have it configured)

```bash
cd backend
railway link  # Link to your Railway project
railway run npm run force:sync:auto
```

## What the Script Does

When run on Railway's PostgreSQL database:
1. Connects to Railway PostgreSQL (via DATABASE_URL environment variable)
2. Drops all existing tables (clears broken schema)
3. Creates fresh tables for all 20 models:
   - Users, Posts, Comments, Likes, Follows, Messages
   - Programs, Purchases, Progresses
   - Achievements, UserAchievements
   - Challenges, ChallengeParticipants
   - Subscriptions, Reports, ProgramReviews, AuditLog
   - **daily_contents, user_streaks, daily_check_ins** ← The ones you need!
4. Verifies tables were created

## After Successful Sync

1. **Restart Railway backend service**
2. Check Railway logs - should see:
   ```
   Database connected!
   Database synced!
   ✓ Server successfully started on port 3001
   ```
3. **Test creating daily content** in admin dashboard
4. **Create new admin user** (database is empty)

## Verification

To verify tables exist on Railway PostgreSQL:

1. Railway dashboard → **Postgres** service → **Connect** → **Query**
2. Run:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
3. Should see 20 tables

## Troubleshooting

- **"Database: SQLite"** in output = You ran locally, not on Railway
- **"Database: PostgreSQL"** in output = Correct! Running on Railway
- **Script succeeds but app still crashes** = Restart backend service
- **Railway CLI not working** = Use Method 1 or 2 instead
