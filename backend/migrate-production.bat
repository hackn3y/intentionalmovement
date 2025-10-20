@echo off
REM Set your production DATABASE_URL before running this script
REM Example: set DATABASE_URL=postgresql://user:password@host:port/database
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set
    echo Please set it before running this script:
    echo   set DATABASE_URL=your-database-url-here
    exit /b 1
)
node add-iscurated-postgres.js
