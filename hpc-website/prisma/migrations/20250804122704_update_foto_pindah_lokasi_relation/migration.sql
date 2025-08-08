/*
  Warnings:

  - You are about to drop the column `pindah_lokasi_id` on the `foto_pindah_lokasi` table. All the data in the column will be lost.
  - Added the required column `detail_barang_masuk_no_seri_id` to the `foto_pindah_lokasi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."foto_pindah_lokasi" DROP CONSTRAINT "foto_pindah_lokasi_pindah_lokasi_id_fkey";

-- AlterTable
ALTER TABLE "public"."foto_pindah_lokasi" DROP COLUMN "pindah_lokasi_id",
ADD COLUMN     "detail_barang_masuk_no_seri_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."foto_pindah_lokasi" ADD CONSTRAINT "foto_pindah_lokasi_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
