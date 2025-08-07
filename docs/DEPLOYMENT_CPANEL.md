# Panduan Deployment ke cPanel dengan Node.js Support

Dokumentasi ini menjelaskan langkah-langkah untuk deploy HPC Website ke cPanel yang mendukung Node.js.

## Prerequisites

### 1. cPanel Requirements
- cPanel dengan Node.js support
- SSH access (opsional, tapi direkomendasikan)
- File Manager access
- Terminal/SSH access

### 2. Project Requirements
- Node.js 18+ 
- npm atau pnpm
- Git (untuk clone repository)

## Langkah-langkah Deployment

### 1. Persiapan Project

#### Build Project untuk Production
```bash
# Install dependencies
npm install

# Build project
npm run build

# Test build
npm start
```

#### File yang Perlu Diperhatikan
- `.env.local` - Environment variables
- `next.config.mjs` - Next.js configuration
- `package.json` - Dependencies dan scripts

### 2. Upload ke cPanel

#### Method 1: File Manager
1. Login ke cPanel
2. Buka **File Manager**
3. Navigasi ke folder public_html atau subdomain
4. Upload semua file project

#### Method 2: Git (Recommended)
```bash
# Di cPanel Terminal atau SSH
cd public_html
git clone [your-repository-url]
cd hpc-website
```

### 3. Setup Environment Variables

#### Buat file .env.production
```bash
# Database
DATABASE_URL="mysql://username:password@localhost/database_name"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# API
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"

# JWT
JWT_SECRET="your-jwt-secret"

# Upload
UPLOAD_DIR="/home/username/public_html/uploads"
```

### 4. Setup Database

#### Buat Database di cPanel
1. Buka **MySQL Databases** di cPanel
2. Buat database baru
3. Buat user database
4. Assign user ke database
5. Update `DATABASE_URL` di `.env.production`

#### Run Database Migrations
```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. Setup Node.js App

#### Di cPanel Node.js App Manager
1. Buka **Node.js App Manager**
2. Klik **Create Application**
3. Isi form:
   - **Node.js version**: 18.x atau 20.x
   - **Application mode**: Production
   - **Application root**: Path ke project folder
   - **Application URL**: Domain atau subdomain
   - **Application startup file**: `server.js` (akan dibuat)

#### Buat server.js untuk Production
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

### 6. Setup Upload Directory

#### Buat folder uploads
```bash
# Di cPanel File Manager atau Terminal
mkdir -p public_html/uploads
mkdir -p public_html/uploads/assembly
mkdir -p public_html/uploads/inspeksi
mkdir -p public_html/uploads/painting
mkdir -p public_html/uploads/pdi
mkdir -p public_html/uploads/pindah-lokasi
mkdir -p public_html/uploads/qc

# Set permissions
chmod 755 public_html/uploads
chmod 755 public_html/uploads/*
```

### 7. Setup Domain/Subdomain

#### A. Subdomain (Recommended)
1. Buat subdomain di cPanel (misal: admin.yourdomain.com)
2. Point ke folder project
3. Setup SSL certificate

#### B. Subfolder
1. Upload ke folder di public_html (misal: public_html/admin)
2. Setup .htaccess untuk routing

### 8. Setup .htaccess (untuk Subfolder)

Jika deploy di subfolder, buat file `.htaccess`:

```apache
RewriteEngine On

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /admin/$1 [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
```

### 9. Install Dependencies dan Build

```bash
# Install dependencies
npm install --production

# Build project
npm run build

# Start application
npm start
```

### 10. Setup PM2 (Optional)

Untuk process management yang lebih baik:

```bash
# Install PM2
npm install -g pm2

# Start app dengan PM2
pm2 start server.js --name "hpc-website"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## Troubleshooting

### 1. Port Issues
- Pastikan port yang digunakan tidak conflict
- Cek firewall settings di cPanel

### 2. Database Connection
- Pastikan database credentials benar
- Cek database permissions
- Test connection dengan Prisma Studio

### 3. File Permissions
```bash
# Set proper permissions
chmod 755 public_html
chmod 644 public_html/.env.production
chmod -R 755 public_html/uploads
```

### 4. Memory Issues
- Upgrade Node.js memory limit
- Optimize images dan assets
- Enable compression

### 5. SSL Issues
- Setup SSL certificate di cPanel
- Update NEXTAUTH_URL dengan https
- Redirect HTTP ke HTTPS

## Monitoring dan Maintenance

### 1. Logs
- Cek application logs di cPanel
- Monitor error logs
- Setup log rotation

### 2. Performance
- Monitor memory usage
- Optimize database queries
- Enable caching

### 3. Security
- Regular security updates
- Monitor failed login attempts
- Backup database regularly

## Backup Strategy

### 1. Database Backup
```bash
# Backup database
mysqldump -u username -p database_name > backup.sql

# Restore database
mysql -u username -p database_name < backup.sql
```

### 2. File Backup
- Backup uploads folder
- Backup .env files
- Backup source code

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] Database connection working
- [ ] File uploads working
- [ ] Authentication working
- [ ] SSL certificate active
- [ ] Error logs clean
- [ ] Performance acceptable
- [ ] Backup strategy in place

## Support

Jika mengalami masalah:
1. Cek cPanel error logs
2. Cek application logs
3. Test database connection
4. Verify environment variables
5. Contact hosting provider support
