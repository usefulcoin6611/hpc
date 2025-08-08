/*
  Warnings:

  - You are about to drop the column `no_seri` on the `detail_barang_masuk` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."detail_barang_masuk_no_seri_key";

-- AlterTable
ALTER TABLE "public"."detail_barang_masuk" DROP COLUMN "no_seri";

-- CreateTable
CREATE TABLE "public"."detail_barang_masuk_no_seri" (
    "id" SERIAL NOT NULL,
    "no_seri" VARCHAR(100) NOT NULL,
    "detail_barang_masuk_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_barang_masuk_no_seri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "detail_barang_masuk_no_seri_no_seri_key" ON "public"."detail_barang_masuk_no_seri"("no_seri");

-- AddForeignKey
ALTER TABLE "public"."detail_barang_masuk_no_seri" ADD CONSTRAINT "detail_barang_masuk_no_seri_detail_barang_masuk_id_fkey" FOREIGN KEY ("detail_barang_masuk_id") REFERENCES "public"."detail_barang_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
