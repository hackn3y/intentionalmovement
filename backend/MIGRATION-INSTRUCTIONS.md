# Database Migration Instructions

## Problem
The Vercel deployment is getting a 500 error because the production PostgreSQL database on Railway is missing the `isCurated` column that was recently added to the Post model.

## Solution
Run the PostgreSQL migration script to add the missing column.

## Option 1: Run via Railway CLI (Recommended)

### Prerequisites
- Install Railway CLI: `npm install -g @railway/cli`
- Login: `railway login`

### Steps
1. Link to your Railway project:
   ```bash
   cd backend
   railway link
   ```

2. Run the migration:
   ```bash
   railway run node add-iscurated-postgres.js
   ```

## Option 2: Run via Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Deployments" tab
4. Click on the latest deployment
5. Open the "Deploy Logs"
6. In the deployment settings, add a temporary "Migration" service:
   - Create a new service
   - Set the start command to: `node add-iscurated-postgres.js`
   - Share the same DATABASE_URL environment variable
   - Deploy and monitor logs
   - Once complete, you can remove this service

## Option 3: SSH into Railway

1. From Railway dashboard, click "Shell" on your backend service
2. Run:
   ```bash
   node add-iscurated-postgres.js
   ```

## Option 4: Automated Migration on Startup (Not Recommended for Production)

Add a migration check to your server startup in `src/server.js`:

```javascript
// Run migrations before starting server (only in production)
if (process.env.NODE_ENV === 'production') {
  require('./migrations/add-iscurated')
    .then(() => server.listen(PORT))
    .catch(err => {
      logger.error('Migration failed:', err);
      process.exit(1);
    });
}
```

## Verification

After running the migration, verify it worked:

1. Check the Vercel deployment - the 500 errors should be gone
2. Or manually verify in Railway:
   ```bash
   railway run psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='Posts' AND column_name='isCurated';"
   ```

## What the Migration Does

- Adds `isCurated` BOOLEAN column to Posts table (defaults to false)
- Creates index on `isCurated` for performance
- Creates composite index on `(isCurated, createdAt)` for curated feed queries
- Safe to run multiple times (checks if column exists first)
