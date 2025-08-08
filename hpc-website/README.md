# Warehouse Management System

Sistem manajemen gudang untuk mengelola inventaris, transaksi, dan proses workflow bengkel.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm atau pnpm

### Setup Cepat
```bash
# 1. Clone repository
git clone <repository-url>
cd web

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local dengan database credentials

# 4. Setup database
npm run db:generate
npm run db:push
npm run db:seed:all

# 5. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

## 📋 Login Credentials

**Admin:**
- Username: `admin`
- Password: `password123`

**Staff QC:**
- Username: `qc_staff`
- Password: `password123`

**Staff Inspeksi:**
- Username: `inspeksi_mesin`
- Password: `password123`

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Development server
npm run build        # Build project
npm run start        # Production server
npm run lint         # Lint code

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed:all  # Seed all data
```

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── prisma/                # Database
├── public/                # Static files
├── services/              # Business logic
└── types/                 # TypeScript types
```

## 🔧 Environment Variables

Buat file `.env.local` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📊 Default Data

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

## 🚀 Features

- ✅ **Authentication & Authorization**
- ✅ **Role-based Access Control**
- ✅ **Master Data Management**
- ✅ **Inventory Management**
- ✅ **Transaction Processing**
- ✅ **File Upload**
- ✅ **Responsive UI**
- ✅ **Real-time Updates**

## 📚 Documentation

Lihat folder `docs/` untuk dokumentasi lengkap:
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Seed Files](docs/SEED_FILES.md)
- [Logout Fix](docs/LOGOUT_FIX.md)
- [Sidebar User Fix](docs/SIDEBAR_USER_FIX.md)

## 🔒 Security

⚠️ **Production Notes:**
- Ganti semua secret keys
- Gunakan password hashing
- Setup HTTPS
- Konfigurasi firewall
- Regular database backup

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Cek koneksi
npm run db:push

# Pastikan PostgreSQL running
# Dan DATABASE_URL benar
```

### Build Issues
```bash
# Clear cache
rm -rf .next
npm run build
```

### Port Issues
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika mengalami masalah:
1. Cek log error di terminal
2. Pastikan prerequisites terpenuhi
3. Cek dokumentasi di `docs/`
4. Restart development server

---

**Happy Coding! 🎉** 