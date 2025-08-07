/*
  Warnings:

  - You are about to drop the column `keterangan` on the `barang_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `no_transaksi` on the `barang_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `barang_masuk` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kode_kedatangan]` on the table `barang_masuk` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."barang_masuk_no_transaksi_key";

-- AlterTable
ALTER TABLE "public"."barang_masuk" DROP COLUMN "keterangan",
DROP COLUMN "no_transaksi",
DROP COLUMN "supplier",
ADD COLUMN     "kode_kedatangan" VARCHAR(50),
ADD COLUMN     "nama_supplier" VARCHAR(100),
ADD COLUMN     "no_form" VARCHAR(50),
ADD COLUMN     "status" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."detail_barang_masuk" ADD COLUMN     "keterangan" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."detail_barang_masuk_no_seri" ADD COLUMN     "keterangan" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "barang_masuk_kode_kedatangan_key" ON "public"."barang_masuk"("kode_kedatangan");
