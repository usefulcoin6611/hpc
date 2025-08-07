#!/bin/bash

# Warehouse Management System Setup Script
# Author: System Administrator
# Date: $(date)

echo "🚀 Warehouse Management System Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    print_info "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_info "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Check if PostgreSQL is running
check_postgres() {
    print_info "Checking PostgreSQL connection..."
    if command -v psql &> /dev/null; then
        if pg_isready -q; then
            print_status "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start PostgreSQL first."
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        print_warning "psql not found. Please make sure PostgreSQL is installed."
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_info "Setting up environment file..."
    
    if [ ! -f .env.local ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.local
            print_status "Created .env.local from .env.example"
        else
            # Create basic .env.local
            cat > .env.local << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# File Upload Configuration (Optional)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"

# Development Configuration
NODE_ENV="development"
EOF
            print_status "Created basic .env.local"
        fi
        
        print_warning "Please edit .env.local with your database credentials"
        print_info "Example DATABASE_URL: postgresql://username:password@localhost:5432/warehouse_db"
    else
        print_status ".env.local already exists"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Generate Prisma client
    if npm run db:generate; then
        print_status "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Push schema to database
    if npm run db:push; then
        print_status "Database schema pushed"
    else
        print_error "Failed to push database schema"
        print_warning "Please check your DATABASE_URL in .env.local"
        exit 1
    fi
}

# Seed database
seed_database() {
    print_info "Seeding database..."
    
    if npm run db:seed:all; then
        print_status "Database seeded successfully"
    else
        print_error "Failed to seed database"
        exit 1
    fi
}

# Build project
build_project() {
    print_info "Building project..."
    
    if npm run build; then
        print_status "Project built successfully"
    else
        print_error "Failed to build project"
        exit 1
    fi
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo
    
    # Run checks
    check_node
    check_npm
    check_postgres
    echo
    
    # Setup process
    install_dependencies
    echo
    
    setup_env
    echo
    
    # Ask user to edit .env.local
    read -p "Have you edited .env.local with your database credentials? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please edit .env.local first, then run this script again"
        exit 1
    fi
    
    setup_database
    echo
    
    seed_database
    echo
    
    build_project
    echo
    
    # Success message
    echo "🎉 Setup completed successfully!"
    echo
    echo "📋 Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Open: http://localhost:3000"
    echo "3. Login with:"
    echo "   - Username: admin"
    echo "   - Password: password123"
    echo
    echo "📚 Documentation:"
    echo "- Setup Guide: docs/SETUP_GUIDE.md"
    echo "- Seed Files: docs/SEED_FILES.md"
    echo
    echo "Happy coding! 🚀"
}

# Run main function
main
