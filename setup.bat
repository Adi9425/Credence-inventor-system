@echo off
echo =========================================
echo   Inventory Management System Setup
echo =========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo √ Node.js is installed
)

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo X npm is not installed
    pause
    exit /b 1
) else (
    echo √ npm is installed
)

echo.
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo X Backend installation failed
    pause
    exit /b 1
)
echo √ Backend dependencies installed successfully

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo X Frontend installation failed
    pause
    exit /b 1
)
echo √ Frontend dependencies installed successfully

cd ..

echo.
echo =========================================
echo   Installation Complete! 
echo =========================================
echo.
echo To start the application:
echo.
echo 1. Start Backend (in one terminal):
echo    cd backend
echo    npm start
echo.
echo 2. Start Frontend (in another terminal):
echo    cd frontend
echo    npm start
echo.
echo The application will open at http://localhost:3000
echo =========================================
pause
