/*
  Warnings:

  - A unique constraint covering the columns `[no_seri]` on the table `detail_barang_masuk` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "detail_barang_masuk_no_seri_key" ON "public"."detail_barang_masuk"("no_seri");
