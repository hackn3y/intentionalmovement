@echo off
echo ========================================
echo Intentional Movement Corp - Deployment
echo ========================================
echo.

echo [1/3] Deploying PWA to Vercel...
echo.
cd mobile
call npm run build:pwa
call vercel --prod
cd ..
echo.

echo [2/3] Deploying Admin Dashboard to Vercel...
echo.
cd admin-dashboard
call vercel --prod
cd ..
echo.

echo [3/3] Backend Deployment (Railway)
echo.
echo To deploy backend:
echo   1. Install Railway CLI: npm install -g @railway/cli
echo   2. Login: railway login
echo   3. Navigate to backend: cd backend
echo   4. Initialize: railway init
echo   5. Add PostgreSQL: railway add
echo   6. Deploy: railway up
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure environment variables in Vercel dashboard
echo 2. Configure environment variables in Railway dashboard
echo 3. Update Google OAuth redirect URIs
echo 4. Configure Stripe webhooks
echo.
pause
