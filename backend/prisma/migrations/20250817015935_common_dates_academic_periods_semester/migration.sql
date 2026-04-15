/*
  Warnings:

  - A unique constraint covering the columns `[pac,pac_modality]` on the table `common_dates_academic_periods` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "academic"."common_dates_academic_periods_pac_key";

-- CreateIndex
CREATE UNIQUE INDEX "common_dates_academic_periods_pac_pac_modality_key" ON "academic"."common_dates_academic_periods"("pac", "pac_modality");
