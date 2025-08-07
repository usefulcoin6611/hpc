# 🚀 HPC Website - Deployment Guide

Panduan lengkap untuk deploy HPC Website ke cPanel dengan Node.js support.

## 📋 Quick Start

### 1. Persiapan Project
```bash
# Clone repository
git clone [your-repository-url]
cd hpc-website

# Install dependencies
npm install

# Build project
npm run build
```

### 2. Setup Environment
```bash
# Copy template environment
cp env.production.template .env.production

# Edit environment variables
nano .env.production
```

### 3. Deploy ke cPanel
```bash
# Run deployment script
npm run deploy

# Atau manual deployment
npm run deploy:cpanel
```

## 🔧 File Konfigurasi

### Environment Variables (.env.production)
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

### Server Configuration (server.js)
- Custom server untuk production
- Error handling
- Port configuration

### Apache Configuration (.htaccess)
- Next.js routing
- Security headers
- Compression
- Caching

## 📁 Struktur Deployment

```
public_html/
├── hpc-website/          # Project folder
│   ├── .env.production   # Environment variables
│   ├── server.js         # Custom server
│   ├── .htaccess         # Apache config
│   ├── deploy.sh         # Deployment script
│   └── ...               # Project files
├── uploads/              # Upload directory
│   ├── assembly/
│   ├── inspeksi/
│   ├── painting/
│   ├── pdi/
│   ├── pindah-lokasi/
│   └── qc/
└── ...                   # Other files
```

## 🗄️ Database Setup

### 1. Buat Database di cPanel
1. Login ke cPanel
2. Buka **MySQL Databases**
3. Buat database baru
4. Buat user database
5. Assign user ke database

### 2. Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

## 🌐 Domain Setup

### Option A: Subdomain (Recommended)
```
admin.yourdomain.com → /home/username/public_html/hpc-website
```

### Option B: Subfolder
```
yourdomain.com/admin → /home/username/public_html/hpc-website
```

## 🔐 Security Setup

### 1. SSL Certificate
- Setup SSL di cPanel
- Update NEXTAUTH_URL dengan https
- Redirect HTTP ke HTTPS

### 2. Environment Variables
- Gunakan strong secrets
- Jangan commit .env files
- Backup environment variables

### 3. File Permissions
```bash
chmod 755 public_html
chmod 644 .env.production
chmod -R 755 uploads/
```

## 📊 Monitoring

### 1. Logs
- Application logs di cPanel
- Error logs monitoring
- Performance monitoring

### 2. Database
- Regular backups
- Performance optimization
- Connection monitoring

### 3. File Uploads
- Disk space monitoring
- File size limits
- Backup uploads folder

## 🔄 Maintenance

### 1. Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build project
npm run build

# Restart application
npm start
```

### 2. Backups
```bash
# Database backup
mysqldump -u username -p database_name > backup.sql

# File backup
tar -czf uploads_backup.tar.gz uploads/
```

### 3. Performance
- Monitor memory usage
- Optimize images
- Enable caching
- Database optimization

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Change port in .env.production
PORT=3001
```

#### 2. Database Connection
```bash
# Test connection
npx prisma db pull

# Check credentials
echo $DATABASE_URL
```

#### 3. File Permissions
```bash
# Fix permissions
chmod 755 public_html
chmod 644 .env.production
chmod -R 755 uploads/
```

#### 4. Memory Issues
```bash
# Check memory usage
free -h

# Optimize Node.js
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 📞 Support

### Contact Information
- **Email**: support@yourdomain.com
- **Documentation**: [docs/DEPLOYMENT_CPANEL.md](docs/DEPLOYMENT_CPANEL.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

### Emergency Contacts
- **Hosting Provider**: Contact cPanel support
- **Database Issues**: Check MySQL logs
- **Application Issues**: Check application logs

## 📝 Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] SSL certificate active
- [ ] Domain/subdomain configured
- [ ] Upload directory created

### Post-Deployment
- [ ] Application accessible
- [ ] Database connection working
- [ ] File uploads working
- [ ] Authentication working
- [ ] Error logs clean
- [ ] Performance acceptable

### Maintenance
- [ ] Regular backups scheduled
- [ ] Monitoring setup
- [ ] Security updates
- [ ] Performance optimization
- [ ] Log rotation configured

---

**Note**: Pastikan untuk selalu backup data sebelum melakukan deployment atau update!
