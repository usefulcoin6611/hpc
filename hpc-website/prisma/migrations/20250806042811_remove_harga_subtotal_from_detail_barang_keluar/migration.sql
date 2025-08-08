/*
  Warnings:

  - You are about to drop the column `harga` on the `detail_barang_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `detail_barang_keluar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."detail_barang_keluar" DROP COLUMN "harga",
DROP COLUMN "subtotal";
