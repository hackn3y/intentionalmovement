# Admin Dashboard Deployment Guide - Netlify

This guide will help you deploy the Intentional Movement Admin Dashboard to Netlify.

## Prerequisites

1. A [Netlify account](https://netlify.com) (free tier is sufficient)
2. Your backend API deployed and accessible (Railway URL)
3. Admin credentials configured in your backend

## Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended)

1. **Login to Netlify**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Sign in with GitHub (recommended) or another provider

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select the `intentionalmovement` repository

3. **Configure Build Settings**
   - **Base directory**: `admin-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-dashboard/build`

4. **Add Environment Variables**
   Click "Show advanced" and add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`

   Replace `your-backend-url.railway.app` with your actual Railway backend URL.

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your admin dashboard
   - You'll get a URL like `https://random-name-12345.netlify.app`

6. **Custom Domain (Optional)**
   - Go to "Domain settings" → "Add custom domain"
   - Follow instructions to configure DNS
   - Suggestion: `admin.intentionalmovementcorporation.com`

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to admin dashboard directory
cd admin-dashboard

# Initialize Netlify site
netlify init

# Follow prompts:
# - Create & configure a new site
# - Build command: npm run build
# - Publish directory: build

# Set environment variable
netlify env:set REACT_APP_API_URL "https://your-backend-url.railway.app/api"

# Deploy
netlify deploy --prod
```

### Option 3: Drag and Drop (Quick Test)

1. **Build locally**
   ```bash
   cd admin-dashboard

   # Set environment variable for build
   # Windows:
   set REACT_APP_API_URL=https://your-backend-url.railway.app/api
   npm run build

   # Mac/Linux:
   REACT_APP_API_URL=https://your-backend-url.railway.app/api npm run build
   ```

2. **Deploy to Netlify**
   - Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop the `build` folder
   - Get instant deployment

## Environment Variables

Configure these in Netlify (Site Settings → Environment Variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend.railway.app/api` | Backend API base URL |

**Important**:
- All environment variables must start with `REACT_APP_`
- Changes to environment variables require a rebuild
- Never put secret keys in React apps - they're visible in the client bundle

## Backend CORS Configuration

Ensure your backend allows requests from your Netlify URL:

1. Go to your Railway backend dashboard
2. Add environment variable:
   - **Key**: `CORS_ORIGIN`
   - **Value**: Add your Netlify URL (comma-separated)
   - Example: `http://localhost:3000,https://your-admin.netlify.app`

## Post-Deployment

1. **Test the deployment**
   - Visit your Netlify URL
   - Try logging in with admin credentials
   - Check browser console for any errors

2. **Enable automatic deployments**
   - Netlify automatically deploys on git push to master
   - Configure in "Build & deploy" settings if needed

3. **Monitor builds**
   - Check "Deploys" tab for build status
   - View build logs if deployment fails

## Troubleshooting

### Build Fails

**Check build logs** in Netlify dashboard for errors:
- Missing dependencies: Ensure all packages are in `package.json` dependencies (not devDependencies)
- Node version: Add `.nvmrc` file if specific version needed

### Blank Page After Deployment

- **Check browser console** for errors
- **Verify API URL**: Ensure `REACT_APP_API_URL` is correct
- **Check CORS**: Backend must allow requests from Netlify domain

### Login Doesn't Work

- **Check API URL**: Must end with `/api` (no trailing slash)
- **Check CORS**: Backend must allow Netlify domain
- **Check Network tab**: See if API requests are failing

### Routing Issues (404 on refresh)

- Already configured in `netlify.toml` and `public/_redirects`
- All routes redirect to `index.html` for client-side routing

## Updating the Deployment

### Via Git (Automatic)

```bash
# Make changes to code
git add .
git commit -m "Update admin dashboard"
git push origin master

# Netlify automatically rebuilds and deploys
```

### Via Netlify CLI (Manual)

```bash
cd admin-dashboard
netlify deploy --prod
```

## Performance Optimization

Already configured in `netlify.toml`:
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Asset caching (1 year for static files)
- ✅ Compression (gzip/brotli)
- ✅ Security headers

## Custom Domain Setup

1. **Add domain in Netlify**
   - Site Settings → Domain management → Add custom domain

2. **Configure DNS** (if using external DNS):
   ```
   Type: CNAME
   Name: admin (or your subdomain)
   Value: your-site.netlify.app
   ```

3. **Enable HTTPS**
   - Netlify automatically provisions SSL certificate
   - Usually takes a few minutes

## Continuous Deployment

Netlify automatically deploys when you:
- ✅ Push to `master` branch
- ✅ Merge pull requests
- ✅ Can configure branch deploys for staging

To disable automatic deploys:
- Site Settings → Build & deploy → Build settings → Stop builds

## Cost

- **Free tier includes**:
  - 100GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - CDN
  - Continuous deployment

- **Should be sufficient for admin dashboard** (low traffic internal tool)

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- Check build logs for detailed error messages
