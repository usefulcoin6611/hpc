/*
  Warnings:

  - You are about to drop the column `kode` on the `jenis_barang` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_created_by_fkey";

-- DropIndex
DROP INDEX "public"."jenis_barang_kode_key";

-- AlterTable
ALTER TABLE "public"."jenis_barang" DROP COLUMN "kode";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "created_by",
ADD COLUMN     "job_type" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."transaksi" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "no_form" VARCHAR(50),
    "jenis_pekerjaan" VARCHAR(100),
    "staff" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "qty" INTEGER NOT NULL DEFAULT 1,
    "ket" TEXT,
    "lokasi" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inspeksi_data" (
    "id" SERIAL NOT NULL,
    "parameter" VARCHAR(200) NOT NULL,
    "hasil" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaksi_id" INTEGER NOT NULL,

    CONSTRAINT "inspeksi_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assembly_data" (
    "id" SERIAL NOT NULL,
    "parameter" VARCHAR(200) NOT NULL,
    "hasil" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaksi_id" INTEGER NOT NULL,

    CONSTRAINT "assembly_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."painting_data" (
    "id" SERIAL NOT NULL,
    "parameter" VARCHAR(200) NOT NULL,
    "hasil" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaksi_id" INTEGER NOT NULL,

    CONSTRAINT "painting_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qc_data" (
    "id" SERIAL NOT NULL,
    "parameter" VARCHAR(200) NOT NULL,
    "aktual" VARCHAR(200),
    "standar" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaksi_id" INTEGER NOT NULL,

    CONSTRAINT "qc_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pdi_data" (
    "id" SERIAL NOT NULL,
    "parameter" VARCHAR(200) NOT NULL,
    "pdi" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaksi_id" INTEGER NOT NULL,

    CONSTRAINT "pdi_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_inspeksi" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,

    CONSTRAINT "foto_inspeksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_assembly" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,

    CONSTRAINT "foto_assembly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_painting" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,

    CONSTRAINT "foto_painting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_qc" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,

    CONSTRAINT "foto_qc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_pdi" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "detail_barang_masuk_no_seri_id" INTEGER NOT NULL,

    CONSTRAINT "foto_pdi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."transaksi" ADD CONSTRAINT "transaksi_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi" ADD CONSTRAINT "transaksi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspeksi_data" ADD CONSTRAINT "inspeksi_data_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assembly_data" ADD CONSTRAINT "assembly_data_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."painting_data" ADD CONSTRAINT "painting_data_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qc_data" ADD CONSTRAINT "qc_data_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pdi_data" ADD CONSTRAINT "pdi_data_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_inspeksi" ADD CONSTRAINT "foto_inspeksi_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_assembly" ADD CONSTRAINT "foto_assembly_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_painting" ADD CONSTRAINT "foto_painting_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_qc" ADD CONSTRAINT "foto_qc_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_pdi" ADD CONSTRAINT "foto_pdi_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
