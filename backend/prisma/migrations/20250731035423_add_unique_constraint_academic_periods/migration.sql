/*
  Warnings:

  - A unique constraint covering the columns `[year,pac,pac_modality]` on the table `academic_periods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_year_pac_pac_modality_key" ON "academic"."academic_periods"("year", "pac", "pac_modality");
