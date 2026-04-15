/*
  Warnings:

  - The primary key for the `center_departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `center_departments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "academic"."center_departments" DROP CONSTRAINT "center_departments_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "center_departments_pkey" PRIMARY KEY ("centerId", "departmentId");
