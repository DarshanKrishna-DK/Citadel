@echo off
echo Starting Citadel Backend Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create a .env file with your Twitch credentials.
    pause
    exit /b 1
)

REM Build the project
echo Building TypeScript...
npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed, trying to start with ts-node...
    echo.
    echo Starting server with ts-node...
    npx ts-node src/server.ts
) else (
    echo Build successful, starting compiled server...
    echo.
    node dist/server.js
)

pause
