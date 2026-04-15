/*
  Warnings:

  - You are about to drop the column `teacherPreferenceId` on the `teacher_preferred_classes` table. All the data in the column will be lost.
  - You are about to drop the `teacher_preferences` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacherId` to the `teacher_preferred_classes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ai"."teacher_preferences" DROP CONSTRAINT "teacher_preferences_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" DROP CONSTRAINT "teacher_preferred_classes_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" DROP CONSTRAINT "teacher_preferred_classes_teacherPreferenceId_fkey";

-- AlterTable
ALTER TABLE "academic"."teachers" ADD COLUMN     "shiftEnd" TIME,
ADD COLUMN     "shiftStart" TIME;

-- AlterTable
ALTER TABLE "ai"."teacher_preferred_classes" DROP COLUMN "teacherPreferenceId",
ADD COLUMN     "teacherId" UUID NOT NULL;

-- DropTable
DROP TABLE "ai"."teacher_preferences";

-- AddForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" ADD CONSTRAINT "teacher_preferred_classes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academic"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" ADD CONSTRAINT "teacher_preferred_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
