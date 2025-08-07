-- AlterTable
ALTER TABLE "public"."transaksi" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" VARCHAR(100),
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;
