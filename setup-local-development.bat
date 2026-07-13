@echo off
REM Domy v Italii - Local Development Setup Script for Windows
REM This script helps you set up the project for local development

echo 🏠 Setting up Domy v Italii for local development...
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
if exist "yarn.lock" (
    echo Using Yarn...
    yarn install
) else (
    echo Using npm...
    npm install --legacy-peer-deps
)

REM Copy environment template
echo.
echo ⚙️ Setting up environment variables...
if not exist ".env.local" (
    copy env.template .env.local >nul
    echo ✅ Created .env.local from template
    echo ⚠️ Please edit .env.local with your actual values before running the app
) else (
    echo ℹ️ .env.local already exists
)

echo.
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Edit .env.local with your Supabase credentials
echo 2. Run the database setup scripts in Supabase:
echo    - db/setup-database-fixed.sql
echo    - db/setup-email-notifications.sql
echo 3. Start the development server: npm run dev
echo    (Windows users: Use npm run dev:simple if you have issues)
echo.
echo For detailed instructions, see README.md
echo.
echo 🚀 Happy coding!
echo.
pause
