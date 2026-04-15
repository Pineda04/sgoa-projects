/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,departmentId,periodId]` on the table `academic_assignment_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "academic_assignment_reports_teacherId_departmentId_periodId_key" ON "academic"."academic_assignment_reports"("teacherId", "departmentId", "periodId");
