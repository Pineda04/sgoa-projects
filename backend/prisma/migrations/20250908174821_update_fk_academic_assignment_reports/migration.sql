/*
  Warnings:

  - You are about to drop the column `departmentId` on the `academic_assignment_reports` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherId,centerDepartmentId,periodId]` on the table `academic_assignment_reports` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `centerDepartmentId` to the `academic_assignment_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "academic"."academic_assignment_reports" DROP CONSTRAINT "academic_assignment_reports_departmentId_fkey";

-- DropIndex
DROP INDEX "academic"."academic_assignment_reports_teacherId_departmentId_periodId_key";

-- AlterTable
ALTER TABLE "academic"."academic_assignment_reports" DROP COLUMN "departmentId",
ADD COLUMN     "centerDepartmentId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "academic_assignment_reports_teacherId_centerDepartmentId_pe_key" ON "academic"."academic_assignment_reports"("teacherId", "centerDepartmentId", "periodId");

-- AddForeignKey
ALTER TABLE "academic"."academic_assignment_reports" ADD CONSTRAINT "academic_assignment_reports_centerDepartmentId_fkey" FOREIGN KEY ("centerDepartmentId") REFERENCES "academic"."center_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
