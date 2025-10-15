# Railway Manual Redeploy Required

## Current Status

The latest code fixes have been pushed to GitHub (commit `7dc3bdf`) but Railway hasn't automatically redeployed yet.

## Commits Pushed

1. `93911e6` - Fix trust proxy for Railway deployment
2. `2deb3a2` - Run database migrations on Railway deployment
3. `7dc3bdf` - Enable database sync in production

## What These Fixes Do

1. **Trust Proxy:** Fixes the ValidationError about X-Forwarded-For header
2. **Database Sync:** Enables `sequelize.sync()` in production to auto-create database tables
3. **Migration Command:** Updates Railway start command to run migrations

## How to Manually Redeploy on Railway

### Method 1: Via Deployments Tab

1. Go to https://railway.app
2. Click on your **backend service** (intentionalmovement-production)
3. Click "**Deployments**" tab
4. Click "**Redeploy**" button (usually in top-right or next to latest deployment)

### Method 2: Via Settings

1. Go to https://railway.app
2. Click on your **backend service**
3. Go to "**Settings**" tab
4. Scroll to deployment section
5. Click "**Redeploy**" or "**Trigger Deploy**"

### Method 3: Enable Auto-Deploy

1. Railway → Backend Service → "**Settings**"
2. Find "**Source**" or "**Deployment Trigger**" section
3. Verify it's watching: `feature/quick-wins-stripe-integration` branch
4. Toggle "**Auto Deploy**" to ON

## After Redeployment

Once Railway redeploys (takes ~1-2 minutes), you should see in the logs:

```
Database connection established successfully.
Database synchronized.
Server running on port 3001 in production mode
```

Then test registration:

```bash
curl -X POST https://intentionalmovement-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser",
    "displayName": "Test User"
  }'
```

Should return a successful response with user data and JWT token!

## Why Auto-Deploy Might Not Be Working

- **Branch Mismatch:** Railway might be watching `main`/`master` instead of `feature/quick-wins-stripe-integration`
- **Auto-Deploy Disabled:** Setting might be toggled off
- **GitHub Webhook Issue:** Railway's webhook might not be configured properly
- **Deployment Queue:** Previous deployments might have failed, blocking new ones

---

**Created:** October 15, 2025, 3:18 AM
**Status:** Waiting for manual redeploy
