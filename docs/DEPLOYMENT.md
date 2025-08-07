# Deployment Guide

## 🚀 Setup untuk cPanel

### 1. Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warehouse_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_URL=/api
```

### 2. Database Setup

1. **Buat database PostgreSQL di cPanel**
2. **Jalankan schema SQL:**

```sql
-- Copy dan jalankan isi dari database/schema.sql
-- Pastikan database warehouse_db sudah dibuat
```

### 3. Build dan Deploy

1. **Build project:**
```bash
npm run build
```

2. **Upload ke cPanel:**
   - Upload semua file ke `public_html`
   - Pastikan Node.js diaktifkan di cPanel
   - Set environment variables di cPanel

3. **Start application:**
```bash
npm start
```

## 🔐 Default Login

- **Username:** admin
- **Password:** password

## 📊 Database Schema

Project menggunakan 3 tabel utama:

1. **users** - Untuk authentication
2. **jenis_barang** - Master data jenis barang
3. **barang** - Data inventory barang

## 🌐 API Endpoints

Semua API tersedia di `/api/*`:

- `/api/auth/login` - Login
- `/api/auth/me` - Get current user
- `/api/users` - User management
- `/api/barang` - Barang management
- `/api/jenis-barang` - Jenis barang management
- `/api/health` - Health check

## ⚠️ Security Notes

- Password sementara disimpan plain text (untuk development)
- JWT secret harus diganti di production
- Database credentials harus aman

## 🔧 Troubleshooting

1. **Database connection error:**
   - Periksa kredensial database di `.env.local`
   - Pastikan PostgreSQL berjalan

2. **Build error:**
   - Jalankan `npm install` terlebih dahulu
   - Periksa TypeScript errors

3. **API tidak berfungsi:**
   - Periksa environment variables
   - Pastikan database schema sudah dijalankan 