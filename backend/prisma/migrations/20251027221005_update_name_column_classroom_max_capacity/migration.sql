/*
  Warnings:

  - You are about to drop the column `maxCapacitiy` on the `classrooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "infraestructure"."classrooms" DROP COLUMN "maxCapacitiy",
ADD COLUMN     "maxCapacity" INTEGER;
