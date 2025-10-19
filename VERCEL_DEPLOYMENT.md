# Vercel Deployment Guide

This guide explains how to deploy the Intentional Movement mobile app to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. The Vercel CLI installed: `npm install -g vercel`
3. Your production environment variables ready

## Environment Variables for Vercel

When deploying to Vercel, you need to configure the following environment variables in the Vercel dashboard (Project Settings > Environment Variables):

### Required Variables

```bash
# Backend API URL - Point to your production backend
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration (Required for Google Sign-In)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

### Optional Variables

```bash
# Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# App Metadata
APP_NAME=Intentional Movement
APP_VERSION=1.0.0
ENVIRONMENT=production
```

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to Vercel dashboard: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `mobile` directory as the root directory
5. Framework Preset: "Create React App" (Vercel will auto-detect)

### 2. Configure Build Settings

In the Vercel project settings:

- **Framework Preset**: Other
- **Root Directory**: `mobile`
- **Build Command**: `npm run build` (or leave auto-detected)
- **Output Directory**: `web-build` (for Expo web builds)
- **Install Command**: `npm install`

### 3. Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add each variable listed above
3. Choose the appropriate environments:
   - Production (for production deployments)
   - Preview (for PR previews)
   - Development (for local development with Vercel CLI)

### 4. Deploy

#### Option 1: Automatic Deployment (Recommended)

Push to your GitHub repository:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

Vercel will automatically detect the push and start a deployment.

#### Option 2: Manual Deployment with Vercel CLI

```bash
# From the mobile directory
cd mobile

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## Important Notes

### Cache Busting

The app already implements cache-busting for API calls using timestamps. However, Vercel's CDN caching may still cache old builds. To force a fresh deployment:

1. Clear Vercel's cache: Project Settings > Functions > Clear Cache
2. Redeploy the project
3. Hard refresh your browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### CORS Configuration

Make sure your backend's CORS_ORIGIN environment variable includes your Vercel deployment URL:

```bash
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000,http://localhost:8081
```

### Backend Deployment

Note: This guide only covers deploying the mobile app. Your backend needs to be deployed separately to a service like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2/ECS

Update the `EXPO_PUBLIC_API_URL` to point to your deployed backend.

### Database

For production, you should use PostgreSQL instead of SQLite. Update your backend's `DATABASE_URL` environment variable with your production PostgreSQL connection string.

Recommended PostgreSQL hosting:
- Supabase (free tier available)
- Railway (free tier available)
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Database

## Troubleshooting

### Programs Not Updating After Edit

If you see stale data after editing programs in the admin dashboard:

1. **Clear Vercel cache**: Project Settings > Functions > Clear Cache
2. **Redeploy**: Deployments > ... > Redeploy
3. **Hard refresh browser**: The app uses cache-busting timestamps, but browser cache can still interfere

### API Connection Issues

If the mobile app can't connect to the backend:

1. Verify `EXPO_PUBLIC_API_URL` is set correctly in Vercel
2. Check your backend CORS settings include the Vercel URL
3. Ensure your backend is running and accessible
4. Check browser console for specific error messages

### Google Sign-In Not Working

1. Add your Vercel deployment URL to Firebase Console:
   - Authentication > Settings > Authorized domains
   - Add: `your-app.vercel.app`
2. Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set in Vercel
3. Check that the Web Client ID matches your Firebase project

## Post-Deployment Checklist

- [ ] Verify all environment variables are set in Vercel
- [ ] Backend CORS includes Vercel URL
- [ ] Firebase authorized domains includes Vercel URL
- [ ] Test Google Sign-In on production
- [ ] Test program purchases with Stripe test mode
- [ ] Verify all pages load correctly
- [ ] Test on multiple devices/browsers
- [ ] Monitor Vercel deployment logs for errors

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests (each PR gets a unique URL)
- **Development**: Pushes to other branches (optional)

Configure branch settings in: Project Settings > Git

## Support

If you encounter issues:
1. Check Vercel deployment logs: Deployments > Click on deployment > View Logs
2. Check browser console for client-side errors
3. Verify environment variables are correctly set
4. Review Vercel documentation: https://vercel.com/docs
