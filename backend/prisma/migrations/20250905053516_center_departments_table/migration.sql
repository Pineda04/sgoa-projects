/*
  Warnings:

  - You are about to drop the column `centerId` on the `departments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic"."departments" DROP CONSTRAINT "departments_centerId_fkey";

-- AlterTable
ALTER TABLE "academic"."departments" DROP COLUMN "centerId";

-- CreateTable
CREATE TABLE "academic"."center_departments" (
    "id" UUID NOT NULL,
    "centerId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "center_departments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "academic"."center_departments" ADD CONSTRAINT "center_departments_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "academic"."centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."center_departments" ADD CONSTRAINT "center_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
