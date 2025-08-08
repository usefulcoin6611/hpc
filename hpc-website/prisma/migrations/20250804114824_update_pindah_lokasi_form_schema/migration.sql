/*
  Warnings:

  - You are about to drop the `lokasi_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."lokasi_data" DROP CONSTRAINT "lokasi_data_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."lokasi_data" DROP CONSTRAINT "lokasi_data_detail_barang_masuk_no_seri_id_fkey";

-- DropTable
DROP TABLE "public"."lokasi_data";

-- CreateTable
CREATE TABLE "public"."pindah_lokasi_form" (
    "id" SERIAL NOT NULL,
    "no_seri" VARCHAR(20) NOT NULL,
    "nama_barang" VARCHAR(255) NOT NULL,
    "lokasi_awal" VARCHAR(100) NOT NULL,
    "lokasi_baru" VARCHAR(100),
    "no_form" VARCHAR(50),
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "detail_barang_masuk_no_seri_id" INTEGER,

    CONSTRAINT "pindah_lokasi_form_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."pindah_lokasi_form" ADD CONSTRAINT "pindah_lokasi_form_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pindah_lokasi_form" ADD CONSTRAINT "pindah_lokasi_form_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
