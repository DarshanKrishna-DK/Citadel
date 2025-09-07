@echo off
title Citadel Backend Server
color 0A

echo ===============================================
echo           CITADEL BACKEND SERVER
echo ===============================================
echo.

REM Change to the script's directory
cd /d "%~dp0"

echo Current Directory: %CD%
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found in PATH!
    echo Please install Node.js or add it to your PATH.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with your Twitch credentials:
    echo.
    echo TWITCH_CLIENT_ID="your_client_id"
    echo TWITCH_CLIENT_SECRET="your_client_secret"
    echo.
    pause
    exit /b 1
)

echo Environment file found: .env
echo.

REM Check if direct-server.js exists
if not exist "direct-server.js" (
    echo ERROR: direct-server.js not found!
    echo Please make sure the server file exists.
    pause
    exit /b 1
)

echo Server file found: direct-server.js
echo.

echo Starting Citadel Backend Server...
echo Press Ctrl+C to stop the server
echo.

REM Start the server using full path to avoid npm hooks
"C:\Program Files\nodejs\node.exe" direct-server.js

REM If that fails, try alternative paths
if %ERRORLEVEL% neq 0 (
    echo.
    echo Trying alternative Node.js path...
    "C:\Program Files (x86)\nodejs\node.exe" direct-server.js
)

REM If still fails, try system node
if %ERRORLEVEL% neq 0 (
    echo.
    echo Trying system Node.js...
    node direct-server.js
)

echo.
echo Server stopped.
pause
