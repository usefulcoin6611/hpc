# Panduan Setup Project Warehouse Management System

## Prerequisites

Sebelum memulai setup, pastikan sistem Anda memiliki:

- **Node.js** (versi 18 atau lebih baru)
- **npm** atau **pnpm** (package manager)
- **PostgreSQL** database server
- **Git** (untuk clone repository)

### Cek Versi
```bash
node --version
npm --version
git --version
```

## Tahap 1: Clone dan Setup Project

### 1.1 Clone Repository
```bash
git clone <repository-url>
cd web
```

### 1.2 Install Dependencies
```bash
# Menggunakan npm
npm install

# Atau menggunakan pnpm (jika tersedia)
pnpm install
```

### 1.3 Setup Environment Variables
Buat file `.env.local` di root project:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Upload (opsional)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880" # 5MB
```

## Tahap 2: Database Setup

### 2.1 Setup PostgreSQL Database
```bash
# Buat database baru
createdb warehouse_db

# Atau menggunakan psql
psql -U postgres
CREATE DATABASE warehouse_db;
\q
```

### 2.2 Setup Prisma
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Atau jika menggunakan migration
npm run db:migrate
```

### 2.3 Seed Database
```bash
# Seed semua data (users + master barang)
npm run db:seed:all

# Atau seed individual
npm run db:seed:users
npm run db:seed:barang
```

## Tahap 3: Development Setup

### 3.1 Build Project
```bash
# Build project
npm run build
```

### 3.2 Jalankan Development Server
```bash
# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

### 3.3 Akses Prisma Studio (Opsional)
```bash
# Buka Prisma Studio untuk melihat database
npm run db:studio
```

Prisma Studio akan berjalan di: `http://localhost:5555`

## Tahap 4: Testing Setup

### 4.1 Test Login
Setelah aplikasi berjalan, test login dengan credentials:

**Admin:**
- Username: `admin`
- Password: `password123`

**Staff QC:**
- Username: `qc_staff`
- Password: `password123`

**Staff Inspeksi:**
- Username: `inspeksi_mesin`
- Password: `password123`

### 4.2 Test Fitur Utama
1. **Login** - Pastikan bisa login dengan berbagai role
2. **Dashboard** - Cek dashboard berfungsi
3. **Master Barang** - Cek data barang muncul
4. **Sidebar** - Cek menu sesuai role user
5. **Logout** - Test fitur logout

## Tahap 5: Troubleshooting

### 5.1 Masalah Database Connection
```bash
# Cek koneksi database
npm run db:push

# Jika error, pastikan:
# 1. PostgreSQL running
# 2. DATABASE_URL benar
# 3. Database warehouse_db sudah dibuat
```

### 5.2 Masalah Dependencies
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### 5.3 Masalah Build
```bash
# Clear cache dan rebuild
npm run build -- --no-cache
```

### 5.4 Masalah Port
```bash
# Jika port 3000 sudah digunakan
# Ganti di package.json atau gunakan port lain
npm run dev -- -p 3001
```

## Tahap 6: Production Setup

### 6.1 Environment Variables Production
```env
# Production environment
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/warehouse_prod"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### 6.2 Build Production
```bash
# Build untuk production
npm run build

# Jalankan production server
npm start
```

## Scripts yang Tersedia

```bash
# Development
npm run dev          # Jalankan development server
npm run build        # Build project
npm run start        # Jalankan production server
npm run lint         # Lint code

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema ke database
npm run db:migrate   # Jalankan migration
npm run db:studio    # Buka Prisma Studio
npm run db:seed      # Seed database (legacy)
npm run db:seed:users    # Seed users saja
npm run db:seed:barang   # Seed master barang saja
npm run db:seed:all      # Seed semua data
```

## Struktur Project

```
web/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   └── dialogs/          # Dialog components
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   ├── seed-users.ts     # User seed data
│   ├── seed-master-barang.ts # Master barang seed data
│   └── seed-all.ts       # Combined seed
├── public/               # Static files
├── services/             # Business logic services
├── types/                # TypeScript types
└── docs/                 # Documentation
```

## Data Default

### Users (8 users)
- **admin** - Administrator
- **supervisor** - Supervisor  
- **inspeksi_mesin** - Ahmad Inspeksi
- **assembly_staff** - Budi Assembly
- **qc_staff** - Citra QC
- **pdi_staff** - Dewi PDI
- **painting_staff** - Eko Painting
- **pindah_lokasi** - Fajar Logistics

### Master Barang (4 items)
- CORGHI ET1450 MOTOR
- HUNTER Tire Changer TCX 45 Red - 1 Ph
- HUNTER Smart Weight Pro
- HUNTER Hawkeye Elite

## Security Notes

⚠️ **Peringatan untuk Production:**
1. Ganti semua secret keys
2. Gunakan password yang di-hash (bcrypt)
3. Setup HTTPS
4. Konfigurasi firewall
5. Backup database secara regular

## Support

Jika mengalami masalah:
1. Cek log error di terminal
2. Pastikan semua prerequisites terpenuhi
3. Cek dokumentasi di folder `docs/`
4. Restart development server jika perlu

## Quick Start Commands

```bash
# Setup lengkap dalam satu kali jalan
git clone <repo>
cd web
npm install
cp .env.example .env.local
# Edit .env.local dengan database credentials
npm run db:generate
npm run db:push
npm run db:seed:all
npm run dev
```

Project siap digunakan! 🎉
