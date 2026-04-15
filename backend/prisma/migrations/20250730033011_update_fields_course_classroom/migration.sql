/*
  Warnings:

  - You are about to drop the column `endHour` on the `course_classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `startHour` on the `course_classrooms` table. All the data in the column will be lost.
  - Added the required column `days` to the `course_classrooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `course_classrooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "academic"."course_classrooms" DROP COLUMN "endHour",
DROP COLUMN "startHour",
ADD COLUMN     "days" TEXT NOT NULL,
ADD COLUMN     "section" TEXT NOT NULL;
