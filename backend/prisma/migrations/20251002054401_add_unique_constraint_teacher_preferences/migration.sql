/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,courseId]` on the table `teacher_preferred_classes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teacher_preferred_classes_teacherId_courseId_key" ON "ai"."teacher_preferred_classes"("teacherId", "courseId");
