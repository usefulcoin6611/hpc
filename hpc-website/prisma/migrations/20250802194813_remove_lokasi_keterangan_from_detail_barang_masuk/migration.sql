/*
  Warnings:

  - You are about to drop the column `keterangan` on the `detail_barang_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `lokasi` on the `detail_barang_masuk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."detail_barang_masuk" DROP COLUMN "keterangan",
DROP COLUMN "lokasi";
