-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jenis_barang" (
    "id" SERIAL NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "jenis_barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barang" (
    "id" SERIAL NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kategori" VARCHAR(50),
    "satuan" VARCHAR(20),
    "stok" INTEGER NOT NULL DEFAULT 0,
    "stok_minimum" INTEGER NOT NULL DEFAULT 0,
    "harga" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "lokasi" VARCHAR(100),
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "jenis_id" INTEGER,
    "created_by" INTEGER,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barang_masuk" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "no_transaksi" VARCHAR(50) NOT NULL,
    "supplier" VARCHAR(100),
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "barang_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detail_barang_masuk" (
    "id" SERIAL NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barang_masuk_id" INTEGER NOT NULL,
    "barang_id" INTEGER NOT NULL,

    CONSTRAINT "detail_barang_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barang_keluar" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "no_transaksi" VARCHAR(50) NOT NULL,
    "tujuan" VARCHAR(100),
    "keterangan" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "approved_by" INTEGER,

    CONSTRAINT "barang_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detail_barang_keluar" (
    "id" SERIAL NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barang_keluar_id" INTEGER NOT NULL,
    "barang_id" INTEGER NOT NULL,

    CONSTRAINT "detail_barang_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_barang_kode_key" ON "public"."jenis_barang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "barang_kode_key" ON "public"."barang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "barang_masuk_no_transaksi_key" ON "public"."barang_masuk"("no_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "barang_keluar_no_transaksi_key" ON "public"."barang_keluar"("no_transaksi");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jenis_barang" ADD CONSTRAINT "jenis_barang_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang" ADD CONSTRAINT "barang_jenis_id_fkey" FOREIGN KEY ("jenis_id") REFERENCES "public"."jenis_barang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang" ADD CONSTRAINT "barang_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_masuk" ADD CONSTRAINT "barang_masuk_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_barang_masuk" ADD CONSTRAINT "detail_barang_masuk_barang_masuk_id_fkey" FOREIGN KEY ("barang_masuk_id") REFERENCES "public"."barang_masuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_barang_masuk" ADD CONSTRAINT "detail_barang_masuk_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar" ADD CONSTRAINT "barang_keluar_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar" ADD CONSTRAINT "barang_keluar_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_barang_keluar" ADD CONSTRAINT "detail_barang_keluar_barang_keluar_id_fkey" FOREIGN KEY ("barang_keluar_id") REFERENCES "public"."barang_keluar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_barang_keluar" ADD CONSTRAINT "detail_barang_keluar_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "public"."barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
