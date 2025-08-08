/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `job_type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('inspeksi_mesin', 'assembly_staff', 'qc_staff', 'pdi_staff', 'painting_staff', 'pindah_lokasi', 'admin', 'supervisor');

-- CreateEnum
CREATE TYPE "public"."UserJobType" AS ENUM ('staff', 'supervisor', 'admin');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'inspeksi_mesin',
DROP COLUMN "job_type",
ADD COLUMN     "job_type" "public"."UserJobType";
