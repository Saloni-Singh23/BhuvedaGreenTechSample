@echo off
REM Bhuveda GreenTech - Quick Start Script
REM This script starts the development server

echo.
echo ========================================
echo   Bhuveda GreenTech - Development Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo Starting server on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm start

pause
