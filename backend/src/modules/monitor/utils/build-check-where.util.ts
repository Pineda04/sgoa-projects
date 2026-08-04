import { BadRequestException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CheckFiltersDto } from '../dto';
import { monitoringDayEnd, monitoringDayStart } from './monitoring-date.util';

export const buildCheckWhere = (
  query: CheckFiltersDto,
  buildingIds?: string[],
): Prisma.ScheduleComplianceCheckWhereInput => {
  const where: Prisma.ScheduleComplianceCheckWhereInput = {};

  if (
    query.dateFrom &&
    query.dateTo &&
    monitoringDayStart(query.dateFrom) > monitoringDayStart(query.dateTo)
  ) {
    throw new BadRequestException(
      'La fecha inicial no puede ser posterior a la fecha final.',
    );
  }

  if (query.dateFrom || query.dateTo) {
    where.checkDate = {
      ...(query.dateFrom ? { gte: monitoringDayStart(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: monitoringDayEnd(query.dateTo) } : {}),
    };
  }

  const effectiveBuildingIds = query.buildingId
    ? [query.buildingId]
    : buildingIds;
  if (effectiveBuildingIds) {
    where.buildingId = { in: effectiveBuildingIds };
  }
  if (query.centerId) {
    where.building = { centerId: query.centerId };
  }

  const courseClassroomWhere: Prisma.CourseClassroomWhereInput = {};

  const assignmentReportWhere: Prisma.AcademicAssignmentReportWhereInput = {};

  if (query.teacherId) {
    assignmentReportWhere.teacherId = query.teacherId;
  }

  if (query.periodId) {
    assignmentReportWhere.periodId = query.periodId;
  }

  if (query.centerDepartmentId) {
    assignmentReportWhere.centerDepartmentId = query.centerDepartmentId;
  }

  if (Object.keys(assignmentReportWhere).length) {
    courseClassroomWhere.teachingSession = {
      assignmentReport: assignmentReportWhere,
    };
  }

  if (Object.keys(courseClassroomWhere).length) {
    where.courseClassroom = courseClassroomWhere;
  }

  return where;
};
