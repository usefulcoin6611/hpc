-- Database Schema untuk Warehouse Admin System
-- Sementara tanpa password encryption

-- Create database (jika belum ada)
-- CREATE DATABASE warehouse_db;

-- Connect to database
-- \c warehouse_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Sementara plain text
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Jenis Barang table
CREATE TABLE IF NOT EXISTS jenis_barang (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Barang table
CREATE TABLE IF NOT EXISTS barang (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jenis_id INTEGER REFERENCES jenis_barang(id),
    kategori VARCHAR(50),
    satuan VARCHAR(20),
    stok INTEGER DEFAULT 0,
    stok_minimum INTEGER DEFAULT 0,
    harga DECIMAL(15,2) DEFAULT 0,
    lokasi VARCHAR(100),
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (username, password, name, email, role) 
VALUES ('admin', 'password', 'Administrator', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample jenis barang
INSERT INTO jenis_barang (kode, nama, deskripsi) VALUES
('JB001', 'Elektronik', 'Barang-barang elektronik'),
('JB002', 'Pakaian', 'Barang-barang pakaian'),
('JB003', 'Makanan', 'Barang-barang makanan')
ON CONFLICT (kode) DO NOTHING;

-- Insert sample barang
INSERT INTO barang (kode, nama, jenis_id, kategori, satuan, stok, harga) VALUES
('BRG001', 'Laptop Asus', 1, 'Komputer', 'Unit', 10, 8000000),
('BRG002', 'Kaos Polos', 2, 'Pakaian Pria', 'Pcs', 50, 50000),
('BRG003', 'Snack Ringan', 3, 'Makanan Ringan', 'Pack', 100, 5000)
ON CONFLICT (kode) DO NOTHING; 