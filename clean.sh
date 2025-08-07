#!/bin/bash

# HPC Website Cleanup Script
# Membersihkan file build dan cache

echo "🧹 Starting cleanup process..."

# Remove Next.js build directory
echo "🗑️ Removing .next directory..."
rm -rf .next

# Remove node_modules cache
echo "🗑️ Removing node_modules cache..."
rm -rf node_modules/.cache

# Remove Prisma generated files
echo "🗑️ Removing Prisma generated files..."
rm -rf node_modules/.prisma

# Remove TypeScript cache
echo "🗑️ Removing TypeScript cache..."
rm -rf .tsbuildinfo

# Remove environment files (optional)
read -p "Do you want to remove environment files? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing environment files..."
    rm -f .env.local
    rm -f .env.production
fi

# Remove uploads (optional)
read -p "Do you want to remove uploads directory? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing uploads directory..."
    rm -rf public/uploads
fi

echo "✅ Cleanup completed successfully!"
echo "📦 You can now run 'npm install' and 'npm run build' for a fresh build."
