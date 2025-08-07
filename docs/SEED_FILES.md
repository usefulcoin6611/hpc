# Seed Files Documentation

## Overview

File seed digunakan untuk mengisi database dengan data awal yang diperlukan untuk testing dan development. Terdapat 3 file seed yang dapat digunakan:

1. **seed-users.ts** - Seed data user dengan berbagai role
2. **seed-master-barang.ts** - Seed data master barang dan jenis barang
3. **seed-all.ts** - Menjalankan kedua seed di atas secara berurutan

## File Seed

### 1. seed-users.ts

File ini akan membuat 8 user dengan berbagai role dan job type sesuai format database:

#### User yang akan dibuat:
- **inspeksi_mesin** - Ahmad Inspeksi (staff)
- **assembly_staff** - Budi Assembly (staff)
- **qc_staff** - Citra QC (staff)
- **pdi_staff** - Dewi PDI (staff)
- **painting_staff** - Eko Painting (staff)
- **pindah_lokasi** - Fajar Logistics (staff)
- **admin** - Administrator (admin)
- **supervisor** - Supervisor (supervisor)

#### Credentials:
- **Username**: sesuai nama user di atas
- **Password**: `password123` (plain text, tidak di-hash)

### 2. seed-master-barang.ts

File ini akan membuat data master barang dan jenis barang sesuai database:

#### Jenis Barang (1 kategori):
- Hunter Equipment - Peralatan Hunter untuk bengkel

#### Master Barang (4 items):
- **CORGHI ET1450 MOTOR** (70010022002) - Motor untuk Corghi ET1450
- **HUNTER Tire Changer TCX 45 Red - 1 Ph** (70790030035) - Hunter Tire Changer TCX 45 warna merah single phase
- **HUNTER Smart Weight Pro** (70790020019) - Hunter Smart Weight Pro balancing equipment
- **HUNTER Hawkeye Elite** (70790030012) - Hunter Hawkeye Elite wheel alignment system

### 3. seed-all.ts

File ini akan menjalankan kedua seed di atas secara berurutan.

## Cara Penggunaan

### Menjalankan Seed Individual

```bash
# Seed users saja
npm run db:seed:users

# Seed master barang saja
npm run db:seed:barang

# Seed semua (users + master barang)
npm run db:seed:all
```

### Menjalankan dengan tsx langsung

```bash
# Seed users
npx tsx prisma/seed-users.ts

# Seed master barang
npx tsx prisma/seed-master-barang.ts

# Seed all
npx tsx prisma/seed-all.ts
```

## Output yang Diharapkan

### Seed Users
```
🌱 Starting user seed...
🗑️  Cleaning existing users...
👥 Creating users...
✅ Created user: Ahmad Inspeksi (inspeksi_mesin) - Role: inspeksi_mesin
✅ Created user: Budi Assembly (assembly_staff) - Role: assembly_staff
✅ Created user: Citra QC (qc_staff) - Role: qc_staff
✅ Created user: Dewi PDI (pdi_staff) - Role: pdi_staff
✅ Created user: Eko Painting (painting_staff) - Role: painting_staff
✅ Created user: Fajar Logistics (pindah_lokasi) - Role: pindah_lokasi
✅ Created user: Administrator (admin) - Role: admin
✅ Created user: Supervisor (supervisor) - Role: supervisor
🎉 User seed completed successfully!

📋 User credentials:
Username: admin, Password: password123
Username: supervisor, Password: password123
Username: inspeksi_mesin, Password: password123
Username: assembly_staff, Password: password123
Username: qc_staff, Password: password123
Username: pdi_staff, Password: password123
Username: painting_staff, Password: password123
Username: pindah_lokasi, Password: password123
```

### Seed Master Barang
```
🌱 Starting master barang seed...
🗑️  Cleaning existing data...
📦 Creating jenis barang...
✅ Created jenis barang: Hunter Equipment
📋 Creating master barang...
✅ Created barang: CORGHI ET1450 MOTOR (70010022002) - Stok: 9
✅ Created barang: HUNTER Tire Changer TCX 45 Red - 1 Ph (70790030035) - Stok: 8
✅ Created barang: HUNTER Smart Weight Pro (70790020019) - Stok: 10
✅ Created barang: HUNTER Hawkeye Elite (70790030012) - Stok: 8
🎉 Master barang seed completed successfully!

📊 Summary:
- Jenis Barang: 1 items
- Master Barang: 4 items
- Total stok: 35 units
```

### Seed All
```
🚀 Starting complete database seed...
=====================================

👥 Seeding users...
🌱 Starting user seed...
...
🎉 User seed completed successfully!

📦 Seeding master barang...
🌱 Starting master barang seed...
...
🎉 Master barang seed completed successfully!

🎉 All seeds completed successfully!
=====================================
✅ Users seeded
✅ Master barang seeded

📋 Quick login info:
Username: admin, Password: password123
```

## Catatan Penting

1. **Password Plain Text**: Password disimpan dalam bentuk plain text untuk kemudahan testing
2. **Data Cleanup**: Setiap seed akan menghapus data yang ada terlebih dahulu
3. **Database Connection**: Pastikan database sudah terhubung dan schema sudah di-push/migrate
4. **Prisma Client**: Pastikan Prisma client sudah di-generate
5. **Format Data**: Data seed disesuaikan dengan format yang ada di database

## Troubleshooting

### Error: Database connection failed
```bash
# Pastikan database running dan DATABASE_URL sudah benar
npm run db:push
```

### Error: Prisma client not generated
```bash
# Generate Prisma client
npm run db:generate
```

### Error: Schema not synced
```bash
# Push schema ke database
npm run db:push
# Atau migrate jika ada perubahan
npm run db:migrate
```

## Customization

Untuk menambah atau mengubah data seed:

1. Edit file `prisma/seed-users.ts` untuk menambah user baru
2. Edit file `prisma/seed-master-barang.ts` untuk menambah barang baru
3. Jalankan seed sesuai kebutuhan

## Security Note

⚠️ **Peringatan**: Seed files ini menggunakan password plain text untuk kemudahan development. Untuk production, pastikan menggunakan password yang di-hash dengan bcrypt atau library hashing lainnya.
