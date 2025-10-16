@echo off
REM Development Server Management Script for Intentional Movement Corp
REM Usage: dev-servers.bat [start|stop|restart|status]

SET BACKEND_PORT=3001
SET ADMIN_PORT=3000
SET MOBILE_PORT=8081

if "%1"=="" goto usage
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
goto usage

:usage
echo Usage: dev-servers.bat [start^|stop^|restart^|status]
echo.
echo Commands:
echo   start    - Start all development servers
echo   stop     - Stop all development servers (kills port processes)
echo   restart  - Restart all development servers
echo   status   - Show status of all development servers
goto end

:status
echo.
echo === Development Server Status ===
echo.
echo Checking Backend (Port %BACKEND_PORT%):
powershell -Command "Get-NetTCPConnection -LocalPort %BACKEND_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { Write-Host 'Running (PID:' $_.OwningProcess ')' -ForegroundColor Green } | Out-Null; if ($?) {} else { Write-Host 'Not Running' -ForegroundColor Red }"
echo.
echo Checking Admin Dashboard (Port %ADMIN_PORT%):
powershell -Command "Get-NetTCPConnection -LocalPort %ADMIN_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { Write-Host 'Running (PID:' $_.OwningProcess ')' -ForegroundColor Green } | Out-Null; if ($?) {} else { Write-Host 'Not Running' -ForegroundColor Red }"
echo.
echo Checking Mobile Metro (Port %MOBILE_PORT%):
powershell -Command "Get-NetTCPConnection -LocalPort %MOBILE_PORT% -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { Write-Host 'Running (PID:' $_.OwningProcess ')' -ForegroundColor Green } | Out-Null; if ($?) {} else { Write-Host 'Not Running' -ForegroundColor Red }"
echo.
goto end

:stop
echo.
echo === Stopping All Development Servers ===
echo.
echo Stopping Backend (Port %BACKEND_PORT%)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%BACKEND_PORT% "') do (
    taskkill /F /PID %%a 2>nul
)
echo.
echo Stopping Admin Dashboard (Port %ADMIN_PORT%)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%ADMIN_PORT% "') do (
    taskkill /F /PID %%a 2>nul
)
echo.
echo Stopping Mobile Metro (Port %MOBILE_PORT%)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%MOBILE_PORT% "') do (
    taskkill /F /PID %%a 2>nul
)
echo.
echo All servers stopped.
echo.
goto end

:start
echo.
echo === Starting All Development Servers ===
echo.
echo Starting Backend (Port %BACKEND_PORT%)...
start "Backend Server" cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Starting Admin Dashboard (Port %ADMIN_PORT%)...
start "Admin Dashboard" cmd /c "cd admin-dashboard && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Mobile Metro (Port %MOBILE_PORT%)...
start "Mobile Metro" cmd /c "cd mobile && npm start"
echo.
echo All servers started! Opening status in 3 seconds...
timeout /t 3 /nobreak >nul
goto status

:restart
call :stop
timeout /t 2 /nobreak >nul
call :start
goto end

:end
