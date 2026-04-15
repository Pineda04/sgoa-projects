-- DropForeignKey
ALTER TABLE "academic"."course_staditics" DROP CONSTRAINT "course_staditics_courseClassroomId_fkey";

-- AddForeignKey
ALTER TABLE "academic"."course_staditics" ADD CONSTRAINT "course_staditics_courseClassroomId_fkey" FOREIGN KEY ("courseClassroomId") REFERENCES "academic"."course_classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
