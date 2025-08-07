@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Warehouse Management System Setup
echo =====================================
echo.

:: Check if Node.js is installed
echo ℹ️  Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

:: Check if npm is installed
echo ℹ️  Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm found: !NPM_VERSION!
)

echo.

:: Install dependencies
echo ℹ️  Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully
)

echo.

:: Setup environment file
echo ℹ️  Setting up environment file...
if not exist .env.local (
    if exist .env.example (
        copy .env.example .env.local >nul
        echo ✅ Created .env.local from .env.example
    ) else (
        echo # Database Configuration > .env.local
        echo DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db" >> .env.local
        echo. >> .env.local
        echo # JWT Configuration >> .env.local
        echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production" >> .env.local
        echo. >> .env.local
        echo # NextAuth Configuration >> .env.local
        echo NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production" >> .env.local
        echo NEXTAUTH_URL="http://localhost:3000" >> .env.local
        echo. >> .env.local
        echo # File Upload Configuration (Optional) >> .env.local
        echo UPLOAD_DIR="./public/uploads" >> .env.local
        echo MAX_FILE_SIZE="5242880" >> .env.local
        echo. >> .env.local
        echo # Development Configuration >> .env.local
        echo NODE_ENV="development" >> .env.local
        echo ✅ Created basic .env.local
    )
    
    echo ⚠️  Please edit .env.local with your database credentials
    echo ℹ️  Example DATABASE_URL: postgresql://username:password@localhost:5432/warehouse_db
) else (
    echo ✅ .env.local already exists
)

echo.

:: Ask user to edit .env.local
set /p CONFIRM="Have you edited .env.local with your database credentials? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ⚠️  Please edit .env.local first, then run this script again
    pause
    exit /b 1
)

:: Setup database
echo ℹ️  Setting up database...

:: Generate Prisma client
echo ℹ️  Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
) else (
    echo ✅ Prisma client generated
)

:: Push schema to database
echo ℹ️  Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    echo ⚠️  Please check your DATABASE_URL in .env.local
    pause
    exit /b 1
) else (
    echo ✅ Database schema pushed
)

echo.

:: Seed database
echo ℹ️  Seeding database...
call npm run db:seed:all
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
) else (
    echo ✅ Database seeded successfully
)

echo.

:: Build project
echo ℹ️  Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build project
    pause
    exit /b 1
) else (
    echo ✅ Project built successfully
)

echo.

:: Success message
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Run: npm run dev
echo 2. Open: http://localhost:3000
echo 3. Login with:
echo    - Username: admin
echo    - Password: password123
echo.
echo 📚 Documentation:
echo - Setup Guide: docs/SETUP_GUIDE.md
echo - Seed Files: docs/SEED_FILES.md
echo.
echo Happy coding! 🚀
echo.
pause
