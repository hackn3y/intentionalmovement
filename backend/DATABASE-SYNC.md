# Database Synchronization Guide

This guide explains how to sync your database schema when deploying to production (Railway) or when you add new models.

## Problem

When you add new Sequelize models (like `DailyContent`, `UserStreak`, `DailyCheckIn`), the tables don't automatically appear in your production PostgreSQL database on Railway. This causes errors like:

```
relation "daily_contents" does not exist
```

## Solution Options

### Option 1: Run Sync Script on Railway (RECOMMENDED)

**Step 1:** Push your code to GitHub
```bash
git add -A
git commit -m "Add database sync script"
git push origin master
```

**Step 2:** On Railway, run the sync command:

1. Go to your Railway project
2. Click on your backend service
3. Go to the "Settings" tab
4. Click "Deploy"
5. Once deployed, go to the "Deployments" tab
6. Click on the latest deployment
7. Go to "View Logs"
8. In the command line at the bottom, run:
   ```bash
   npm run sync:production
   ```

Or you can SSH into Railway and run:
```bash
railway run npm run sync:production
```

**Step 3:** Restart your backend service on Railway

### Option 2: Auto-sync on Startup (Already Configured)

Your backend automatically runs `sequelize.sync({ force: false })` on startup in development mode. However, in production, you may need to manually trigger the sync the first time.

The server.js already includes this code:
```javascript
await sequelize.sync({ force: false });
```

Simply restart your Railway service and check the logs to see if tables were created.

### Option 3: Run Migration Locally Then Push Schema

If you have direct database access:

```bash
cd backend
npm run migrate
```

This will sync your local database, then you can dump the schema and apply it to production.

## Scripts Available

| Script | Command | Description |
|--------|---------|-------------|
| Production Sync | `npm run sync:production` | Comprehensive sync script with detailed logging |
| Basic Migration | `npm run migrate` | Simple migration using sequelize.sync |
| Seed Data | `npm run seed` | Populate database with sample data |

## What Gets Created

When you run the sync, these tables will be created:

1. **daily_contents** - Stores daily motivational content (quotes, tips, challenges, etc.)
2. **user_streaks** - Tracks user check-in streaks
3. **daily_check_ins** - Records when users check in to daily content

Plus all your existing tables (users, posts, programs, etc.)

## Checking If Tables Exist

### On Railway:

1. Go to your PostgreSQL database plugin
2. Click "Connect"
3. Use the provided credentials to connect with a PostgreSQL client
4. Run:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### Locally:

```bash
cd backend
node -e "const {sequelize} = require('./src/models'); sequelize.authenticate().then(() => sequelize.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \\'public\\';')).then(([r]) => console.log(r.map(t => t.table_name)));"
```

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Make sure you have the DATABASE_URL environment variable set on Railway
- Check Railway → Your Service → Variables tab

### Error: "Connection refused"
- Ensure your PostgreSQL database is running on Railway
- Check that the DATABASE_URL is correct
- Verify firewall settings allow Railway to connect

### Error: "sequelize.sync is not a function"
- This means models aren't loading properly
- Check that all model files are in `backend/src/models/`
- Verify models are exported in `backend/src/models/index.js`

### Tables created but still getting "relation does not exist"
- Restart your Railway backend service
- Clear any connection pools
- Check that you're connecting to the right database

## Best Practices

1. **Always backup before syncing** - Use `alter: true` instead of `force: true`
2. **Test locally first** - Run migrations on your local database before production
3. **Check logs** - Always review Railway logs after running sync
4. **Document changes** - Keep track of when you add new models
5. **Use migrations** - For complex schema changes, consider using proper migration tools like Sequelize CLI

## Safe vs Destructive Syncs

| Method | Safe | Description |
|--------|------|-------------|
| `sync({ force: false })` | ✅ Yes | Creates missing tables, doesn't touch existing data |
| `sync({ alter: true })` | ✅ Mostly | Updates schema, may modify columns |
| `sync({ force: true })` | ❌ NO | Drops all tables and recreates - **DELETES ALL DATA** |

**Never use `force: true` in production!**

## After Syncing

1. Verify tables exist (see "Checking If Tables Exist" above)
2. Check that your API endpoints work
3. Test creating daily content in the admin dashboard
4. Verify the mobile app can fetch daily content
5. Monitor Railway logs for any database errors

## Questions?

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Ensure PostgreSQL plugin is running
4. Try restarting the backend service
5. Check this guide for troubleshooting steps
