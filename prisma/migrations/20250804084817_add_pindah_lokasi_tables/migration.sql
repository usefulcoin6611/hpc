-- CreateTable
CREATE TABLE "public"."pindah_lokasi" (
    "id" SERIAL NOT NULL,
    "no_seri" VARCHAR(20) NOT NULL,
    "dari_lokasi" VARCHAR(100) NOT NULL,
    "ke_lokasi" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "detail_barang_masuk_no_seri_id" INTEGER,

    CONSTRAINT "pindah_lokasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foto_pindah_lokasi" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pindah_lokasi_id" INTEGER,

    CONSTRAINT "foto_pindah_lokasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."pindah_lokasi" ADD CONSTRAINT "pindah_lokasi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pindah_lokasi" ADD CONSTRAINT "pindah_lokasi_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foto_pindah_lokasi" ADD CONSTRAINT "foto_pindah_lokasi_pindah_lokasi_id_fkey" FOREIGN KEY ("pindah_lokasi_id") REFERENCES "public"."pindah_lokasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
