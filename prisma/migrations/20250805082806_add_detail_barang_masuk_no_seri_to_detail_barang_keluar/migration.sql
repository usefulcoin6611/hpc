/*
  Warnings:

  - Added the required column `detail_barang_masuk_no_seri_id` to the `detail_barang_keluar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."detail_barang_keluar" ADD COLUMN     "detail_barang_masuk_no_seri_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."detail_barang_keluar" ADD CONSTRAINT "detail_barang_keluar_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
