import { Prisma } from 'src/generated/prisma/client';
import { AnalyticsEffectiveScope } from '../types';

export const analyticsScopeToCourseClassroomWhere = (
  scope: AnalyticsEffectiveScope,
  periodId: string,
): Prisma.CourseClassroomWhereInput => ({
  OR: scope.branches.map((branch) => {
    const assignmentReport: Prisma.AcademicAssignmentReportWhereInput = {
      periodId,
    };

    if (branch.type === 'teacher') {
      assignmentReport.teacherId = branch.teacherId;
    } else {
      if (branch.teacherId) assignmentReport.teacherId = branch.teacherId;
      if (branch.centerDepartmentIds) {
        assignmentReport.centerDepartmentId = {
          in: branch.centerDepartmentIds,
        };
      }
    }

    return { teachingSession: { assignmentReport } };
  }),
});
