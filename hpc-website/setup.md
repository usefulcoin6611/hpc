# Setup Instructions

## Install Dependencies

Karena ada masalah dengan PowerShell execution policy, silakan gunakan file batch yang sudah disediakan:

### Option 1: Menggunakan file batch (Recommended)
```bash
install.bat
```

### Option 2: Menggunakan Command Prompt (cmd)
```bash
npm install
```

### Option 3: Menggunakan PowerShell dengan bypass
```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### Option 4: Menggunakan yarn
```bash
yarn install
```

### Option 5: Menggunakan pnpm
```bash
pnpm install
```

## Environment Variables

Copy file `env.local` ke `.env.local`:
```bash
setup-env.bat
```

Atau manual:
```bash
copy env.local .env.local
```

## Database Setup

1. Install PostgreSQL di komputer Anda
2. Buat database baru dengan nama `warehouse_db`
3. Setup Prisma dan jalankan migrasi:

```bash
# Generate Prisma client
npm run db:generate
npx prisma generate
# Push schema ke database (untuk development)
npm run db:push
npx prisma db push
# Atau gunakan migrasi (untuk production)
npm run db:migrate

# Seed database dengan data awal
npm run db:seed
```

### Alternatif: Menggunakan Prisma Studio

Untuk melihat dan mengelola database secara visual:

```bash
npm run db:studio
```

## Start Development Server

```bash
npm run dev
```

## Default Login

- Username: admin
- Password: password 