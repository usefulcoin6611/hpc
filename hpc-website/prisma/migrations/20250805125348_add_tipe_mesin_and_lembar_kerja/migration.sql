-- AlterTable
ALTER TABLE "public"."transaksi" ADD COLUMN     "tipe_mesin" VARCHAR(100);

-- CreateTable
CREATE TABLE "public"."lembar_kerja" (
    "id" SERIAL NOT NULL,
    "jenis_pekerjaan" VARCHAR(100) NOT NULL,
    "tipe_mesin" VARCHAR(100) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "versi" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lembar_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lembar_kerja_jenis_pekerjaan_tipe_mesin_key" ON "public"."lembar_kerja"("jenis_pekerjaan", "tipe_mesin");
