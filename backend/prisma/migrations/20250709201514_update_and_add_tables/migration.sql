/*
  Warnings:

  - You are about to drop the column `pac` on the `academic_assignment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `academic_assignment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentReportId` on the `course_classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `ABD` on the `teaching_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `APB` on the `teaching_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `NSP` on the `teaching_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `RPB` on the `teaching_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `courseClassroomId` on the `teaching_sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courseId,classroomId,teachingSessionId,groupCode]` on the table `course_classrooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodId` to the `academic_assignment_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingSessionId` to the `course_classrooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignmentReportId` to the `teaching_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "academic"."course_classrooms" DROP CONSTRAINT "course_classrooms_assignmentReportId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."teaching_sessions" DROP CONSTRAINT "teaching_sessions_courseClassroomId_fkey";

-- DropIndex
DROP INDEX "academic"."course_classrooms_courseId_classroomId_assignmentReportId_g_key";

-- AlterTable
ALTER TABLE "academic"."academic_assignment_reports" DROP COLUMN "pac",
DROP COLUMN "year",
ADD COLUMN     "periodId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "academic"."course_classrooms" DROP COLUMN "assignmentReportId",
ADD COLUMN     "teachingSessionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "academic"."teaching_sessions" DROP COLUMN "ABD",
DROP COLUMN "APB",
DROP COLUMN "NSP",
DROP COLUMN "RPB",
DROP COLUMN "courseClassroomId",
ADD COLUMN     "assignmentReportId" UUID NOT NULL,
ALTER COLUMN "consultHour" DROP NOT NULL,
ALTER COLUMN "tutoringHour" DROP NOT NULL;

-- CreateTable
CREATE TABLE "academic"."academic_periods" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "pac" INTEGER NOT NULL,
    "pac_modality" TEXT NOT NULL DEFAULT 'Trimestre',

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."course_staditics" (
    "id" UUID NOT NULL,
    "APB" INTEGER NOT NULL,
    "RPB" INTEGER NOT NULL,
    "NSP" INTEGER NOT NULL,
    "ABD" INTEGER NOT NULL,
    "courseClassroomId" UUID NOT NULL,

    CONSTRAINT "course_staditics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_classrooms_courseId_classroomId_teachingSessionId_gr_key" ON "academic"."course_classrooms"("courseId", "classroomId", "teachingSessionId", "groupCode");

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_teachingSessionId_fkey" FOREIGN KEY ("teachingSessionId") REFERENCES "academic"."teaching_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."academic_assignment_reports" ADD CONSTRAINT "academic_assignment_reports_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "academic"."academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teaching_sessions" ADD CONSTRAINT "teaching_sessions_assignmentReportId_fkey" FOREIGN KEY ("assignmentReportId") REFERENCES "academic"."academic_assignment_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."course_staditics" ADD CONSTRAINT "course_staditics_courseClassroomId_fkey" FOREIGN KEY ("courseClassroomId") REFERENCES "academic"."course_classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
