/*
  Warnings:

  - You are about to drop the column `postgradId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `undergradId` on the `teachers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic"."teachers" DROP CONSTRAINT "teachers_postgradId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."teachers" DROP CONSTRAINT "teachers_undergradId_fkey";

-- AlterTable
ALTER TABLE "academic"."teachers" DROP COLUMN "postgradId",
DROP COLUMN "undergradId";

-- CreateTable
CREATE TABLE "academic"."teacher_undergraduate_degrees" (
    "teacherId" UUID NOT NULL,
    "undergraduateId" UUID NOT NULL,

    CONSTRAINT "teacher_undergraduate_degrees_pkey" PRIMARY KEY ("teacherId","undergraduateId")
);

-- CreateTable
CREATE TABLE "academic"."teacher_postgraduate_degrees" (
    "teacherId" UUID NOT NULL,
    "postgraduateId" UUID NOT NULL,

    CONSTRAINT "teacher_postgraduate_degrees_pkey" PRIMARY KEY ("teacherId","postgraduateId")
);

-- AddForeignKey
ALTER TABLE "academic"."teacher_undergraduate_degrees" ADD CONSTRAINT "teacher_undergraduate_degrees_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_undergraduate_degrees" ADD CONSTRAINT "teacher_undergraduate_degrees_undergraduateId_fkey" FOREIGN KEY ("undergraduateId") REFERENCES "academic"."undergraduate_degrees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_postgraduate_degrees" ADD CONSTRAINT "teacher_postgraduate_degrees_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_postgraduate_degrees" ADD CONSTRAINT "teacher_postgraduate_degrees_postgraduateId_fkey" FOREIGN KEY ("postgraduateId") REFERENCES "academic"."postgraduate_degrees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
