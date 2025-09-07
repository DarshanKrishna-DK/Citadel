@echo off
cd /d "%~dp0"
echo Starting Citadel Backend Server...
echo Current directory: %CD%
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please make sure .env file exists with Twitch credentials.
    pause
    exit /b 1
)

echo Environment file found: .env
echo.

REM Try to start the direct server
echo Starting server with Node.js directly...
node.exe direct-server.js

pause
