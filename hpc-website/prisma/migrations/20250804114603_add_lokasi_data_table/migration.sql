-- CreateTable
CREATE TABLE "public"."lokasi_data" (
    "id" SERIAL NOT NULL,
    "no_seri" VARCHAR(20) NOT NULL,
    "parameter" TEXT NOT NULL,
    "hasil" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "detail_barang_masuk_no_seri_id" INTEGER,

    CONSTRAINT "lokasi_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."lokasi_data" ADD CONSTRAINT "lokasi_data_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lokasi_data" ADD CONSTRAINT "lokasi_data_detail_barang_masuk_no_seri_id_fkey" FOREIGN KEY ("detail_barang_masuk_no_seri_id") REFERENCES "public"."detail_barang_masuk_no_seri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
