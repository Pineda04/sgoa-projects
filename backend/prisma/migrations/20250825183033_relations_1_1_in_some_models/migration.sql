/*
  Warnings:

  - A unique constraint covering the columns `[courseClassroomId]` on the table `course_staditics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,departmentId]` on the table `teacher_department_position` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assignmentReportId]` on the table `teaching_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `verification_medias` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "infraestructure"."classrooms" ADD COLUMN     "maxCapacitiy" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "course_staditics_courseClassroomId_key" ON "academic"."course_staditics"("courseClassroomId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_department_position_teacherId_departmentId_key" ON "academic"."teacher_department_position"("teacherId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "academic"."teachers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_sessions_assignmentReportId_key" ON "academic"."teaching_sessions"("assignmentReportId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_medias_activityId_key" ON "academic"."verification_medias"("activityId");
