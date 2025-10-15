@echo off
echo Restarting Expo server...

REM Kill any process using port 8081
echo Killing processes on port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    echo Killing PID %%a
    taskkill /PID %%a /F 2>nul
)

REM Kill any process using port 8082 as backup
echo Killing processes on port 8082...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8082 ^| findstr LISTENING') do (
    echo Killing PID %%a
    taskkill /PID %%a /F 2>nul
)

REM Kill any node processes that might be hanging
echo Killing any hanging node processes...
taskkill /IM node.exe /F 2>nul

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Clear cache directories
echo Clearing cache...
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul

REM Start Expo with clear cache on port 8082
echo Starting Expo on port 8082...
set RCT_METRO_PORT=8082
npx expo start --clear --port 8082