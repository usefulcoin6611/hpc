/*
  Warnings:

  - You are about to drop the column `harga` on the `detail_barang_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `detail_barang_masuk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."detail_barang_masuk" DROP COLUMN "harga",
DROP COLUMN "subtotal";
