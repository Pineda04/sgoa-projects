import { endOfDay, startOfDay } from 'date-fns';
import { Prisma } from 'src/generated/prisma/client';
import { CheckFiltersDto } from '../dto';

export const buildCheckWhere = (
  query: CheckFiltersDto,
): Prisma.ScheduleComplianceCheckWhereInput => {
  const where: Prisma.ScheduleComplianceCheckWhereInput = {};

  if (query.dateFrom || query.dateTo) {
    where.checkDate = {
      ...(query.dateFrom ? { gte: startOfDay(new Date(query.dateFrom)) } : {}),
      ...(query.dateTo ? { lte: endOfDay(new Date(query.dateTo)) } : {}),
    };
  }

  const courseClassroomWhere: Prisma.CourseClassroomWhereInput = {};

  if (query.teacherId) {
    courseClassroomWhere.teachingSession = {
      assignmentReport: { teacherId: query.teacherId },
    };
  }

  if (query.buildingId || query.centerId) {
    courseClassroomWhere.classroom = {
      ...(query.buildingId ? { buildingId: query.buildingId } : {}),
      ...(query.centerId ? { building: { centerId: query.centerId } } : {}),
    };
  }

  if (Object.keys(courseClassroomWhere).length) {
    where.courseClassroom = courseClassroomWhere;
  }

  return where;
};
