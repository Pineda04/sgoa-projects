/*
  Warnings:

  - You are about to drop the `common_dates_academic_periods` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endDate` to the `academic_periods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `academic_periods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "academic"."academic_periods" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "academic"."common_dates_academic_periods";
