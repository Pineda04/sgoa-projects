/*
  Warnings:

  - A unique constraint covering the columns `[classroomId,departmentId]` on the table `classrooms_departments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "infraestructure"."classrooms_departments" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_departments_classroomId_departmentId_key" ON "infraestructure"."classrooms_departments"("classroomId", "departmentId");
