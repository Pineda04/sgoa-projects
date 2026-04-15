-- DropForeignKey
ALTER TABLE "academic"."complementary_activities" DROP CONSTRAINT "complementary_activities_assignmentReportId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."course_classrooms" DROP CONSTRAINT "course_classrooms_teachingSessionId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."teaching_sessions" DROP CONSTRAINT "teaching_sessions_assignmentReportId_fkey";

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_teachingSessionId_fkey" FOREIGN KEY ("teachingSessionId") REFERENCES "academic"."teaching_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teaching_sessions" ADD CONSTRAINT "teaching_sessions_assignmentReportId_fkey" FOREIGN KEY ("assignmentReportId") REFERENCES "academic"."academic_assignment_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."complementary_activities" ADD CONSTRAINT "complementary_activities_assignmentReportId_fkey" FOREIGN KEY ("assignmentReportId") REFERENCES "academic"."academic_assignment_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
