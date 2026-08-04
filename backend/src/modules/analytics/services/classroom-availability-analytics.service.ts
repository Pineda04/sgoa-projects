import { BadRequestException, Injectable } from '@nestjs/common';
import {
  courseClassroomSectionsOverlap,
  parseCourseClassroomDays,
  parseCourseClassroomSection,
} from 'src/common/utils/course-classroom-schedule.util';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ClassroomAvailabilityDetailsDto,
  ClassroomAvailabilityExportDto,
  ClassroomAvailabilityFiltersDto,
} from '../dto';
import {
  AnalyticsCoverage,
  AnalyticsCoverageReason,
  AnalyticsEffectiveScope,
  AnalyticsMetricResult,
} from '../types';
import {
  AnalyticsClassroom,
  ClassroomAnalyticsUniverseService,
} from './classroom-analytics-universe.service';

type Occupancy = {
  id: string;
  classroomId: string;
  days: string;
  section: string;
  groupCode: string;
  course: { code: string; name: string };
  teachingSession: {
    assignmentReport: {
      teacherId: string;
      centerDepartmentId: string;
      teacher: { user: { name: string } };
    };
  };
};

export type ClassroomAvailabilityConflict =
  | {
      visibility: 'full';
      startTime: string;
      endTime: string;
      courseCode: string;
      courseName: string;
      groupCode: string;
      teacherName: string;
    }
  | {
      visibility: 'restricted';
      startTime: string;
      endTime: string;
    };

export type ClassroomAvailabilityScheduleIssue =
  | {
      visibility: 'full';
      reason: 'invalid_schedule_days' | 'invalid_schedule_section';
      rawDays: string;
      rawSection: string;
    }
  | {
      visibility: 'restricted';
      reason: 'invalid_schedule_days' | 'invalid_schedule_section';
    };

export type ClassroomAvailabilityRow = {
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
  status: 'occupied' | 'available' | 'indeterminate';
  dataStatus: 'complete' | 'partial';
  conflictCount: number;
  conflicts: ClassroomAvailabilityConflict[];
  scheduleIssues: ClassroomAvailabilityScheduleIssue[];
};

const CURRENT_CATALOG_NOTE = 'current_classroom_catalog' as const;

@Injectable()
export class ClassroomAvailabilityAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly universeService: ClassroomAnalyticsUniverseService,
  ) {}

  async getSummary(userId: string, filters: ClassroomAvailabilityFiltersDto) {
    const rows = await this.buildRows(userId, filters);
    const eligible = rows.length;
    const occupied = rows.filter(({ status }) => status === 'occupied').length;
    const available = rows.filter(
      ({ status }) => status === 'available',
    ).length;
    const indeterminate = rows.filter(
      ({ status }) => status === 'indeterminate',
    ).length;
    const hasIssues = rows.some(({ scheduleIssues }) => scheduleIssues.length);
    const coverage = this.coverage(rows, occupied + available, eligible);
    const classified = occupied + available;

    return {
      periodId: filters.periodId,
      dayOfWeek: filters.dayOfWeek,
      startTime: filters.startTime,
      endTime: filters.endTime,
      notes: [CURRENT_CATALOG_NOTE],
      metrics: {
        eligibleClassrooms: this.metric(
          'eligibleClassrooms',
          eligible,
          'complete',
          undefined,
          [CURRENT_CATALOG_NOTE],
        ),
        occupiedClassrooms: this.metric(
          'occupiedClassrooms',
          occupied,
          hasIssues || indeterminate ? 'partial' : 'complete',
          coverage,
        ),
        availableClassrooms: this.metric(
          'availableClassrooms',
          available,
          hasIssues || indeterminate ? 'partial' : 'complete',
          coverage,
        ),
        indeterminateClassrooms: this.metric(
          'indeterminateClassrooms',
          indeterminate,
          'complete',
        ),
        occupancyRate: {
          key: 'occupancyRate',
          value:
            eligible > 0 && indeterminate === 0
              ? (occupied / eligible) * 100
              : null,
          unit: 'percentage',
          dataStatus:
            eligible === 0
              ? 'not_applicable'
              : indeterminate > 0
                ? classified > 0
                  ? 'partial'
                  : 'unavailable'
                : hasIssues
                  ? 'partial'
                  : 'complete',
          numerator: occupied,
          denominator: eligible,
          ...(eligible > 0 ? { coverage } : {}),
        } satisfies AnalyticsMetricResult,
      },
    };
  }

  async getDetails(userId: string, filters: ClassroomAvailabilityDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    this.validatePagination(page, size);
    const rows = await this.buildRows(userId, filters);
    const start = (page - 1) * size;

    return {
      metric: filters.metric,
      periodId: filters.periodId,
      dayOfWeek: filters.dayOfWeek,
      startTime: filters.startTime,
      endTime: filters.endTime,
      notes: [CURRENT_CATALOG_NOTE],
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: ClassroomAvailabilityExportDto,
  ): Promise<ClassroomAvailabilityRow[]> {
    return this.buildRows(userId, filters);
  }

  private async buildRows(
    userId: string,
    filters: ClassroomAvailabilityFiltersDto &
      Partial<Pick<ClassroomAvailabilityExportDto, 'sort'>>,
  ): Promise<ClassroomAvailabilityRow[]> {
    this.validateRange(filters.startTime, filters.endTime);
    const { scope, classrooms: visibleClassrooms } =
      await this.universeService.load(
        userId,
        filters.periodId,
        filters.centerDepartmentId,
        'classrooms',
      );
    const occupancies = await this.loadOccupancies(
      visibleClassrooms.map(({ id }) => id),
      filters.periodId,
    );
    const occupancyByClassroom = new Map<string, Occupancy[]>();
    for (const occupancy of occupancies) {
      const current = occupancyByClassroom.get(occupancy.classroomId) ?? [];
      current.push(occupancy);
      occupancyByClassroom.set(occupancy.classroomId, current);
    }

    const querySection = `${filters.startTime} - ${filters.endTime}`;
    const rows = visibleClassrooms.map((classroom) =>
      this.toRow(
        classroom,
        occupancyByClassroom.get(classroom.id) ?? [],
        scope,
        filters.dayOfWeek,
        querySection,
      ),
    );
    this.sortRows(rows, filters.sort);
    return rows;
  }

  private validateRange(startTime: string, endTime: string) {
    const start = parseCourseClassroomSection(`${startTime} - ${endTime}`);
    if (!start) {
      throw new BadRequestException(
        '<startTime> debe ser menor que <endTime>.',
      );
    }
  }

  private validatePagination(page: number, size: number) {
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(size) ||
      page < 1 ||
      size < 1 ||
      size > 100
    ) {
      throw new BadRequestException(
        '<page> debe ser mayor a cero y <size> debe estar entre 1 y 100.',
      );
    }
  }

  private loadOccupancies(classroomIds: string[], periodId: string) {
    if (!classroomIds.length) return Promise.resolve([] as Occupancy[]);
    return this.prisma.courseClassroom.findMany({
      where: {
        classroomId: { in: classroomIds },
        modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
        teachingSession: { assignmentReport: { periodId } },
      },
      select: {
        id: true,
        classroomId: true,
        days: true,
        section: true,
        groupCode: true,
        course: { select: { code: true, name: true } },
        teachingSession: {
          select: {
            assignmentReport: {
              select: {
                teacherId: true,
                centerDepartmentId: true,
                teacher: { select: { user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });
  }

  private toRow(
    classroom: AnalyticsClassroom,
    occupancies: Occupancy[],
    scope: AnalyticsEffectiveScope,
    dayOfWeek: ClassroomAvailabilityFiltersDto['dayOfWeek'],
    querySection: string,
  ): ClassroomAvailabilityRow {
    const conflicts: ClassroomAvailabilityConflict[] = [];
    const issues = new Map<
      string,
      ClassroomAvailabilityRow['scheduleIssues'][number]
    >();

    for (const occupancy of occupancies) {
      const full = this.isInsideScope(scope, occupancy);
      const addIssue = (
        reason: ClassroomAvailabilityScheduleIssue['reason'],
      ) => {
        const visibility = full ? 'full' : 'restricted';
        const key = `${visibility}:${reason}`;
        if (issues.has(key)) return;
        issues.set(
          key,
          full
            ? {
                visibility: 'full',
                reason,
                rawDays: occupancy.days,
                rawSection: occupancy.section,
              }
            : { visibility: 'restricted', reason },
        );
      };
      const days = parseCourseClassroomDays(occupancy.days);
      const section = parseCourseClassroomSection(occupancy.section);
      if (!days) {
        if (
          !section ||
          courseClassroomSectionsOverlap(occupancy.section, querySection)
        ) {
          addIssue('invalid_schedule_days');
          if (!section) {
            addIssue('invalid_schedule_section');
          }
        }
        continue;
      }
      if (!days.includes(dayOfWeek)) continue;
      if (!section) {
        addIssue('invalid_schedule_section');
        continue;
      }
      if (!courseClassroomSectionsOverlap(occupancy.section, querySection)) {
        continue;
      }
      conflicts.push(
        full
          ? {
              visibility: 'full',
              startTime: section.startTime,
              endTime: section.endTime,
              courseCode: occupancy.course.code,
              courseName: occupancy.course.name,
              groupCode: occupancy.groupCode,
              teacherName:
                occupancy.teachingSession.assignmentReport.teacher.user.name,
            }
          : {
              visibility: 'restricted',
              startTime: section.startTime,
              endTime: section.endTime,
            },
      );
    }

    return {
      classroomId: classroom.id,
      classroomName: classroom.name,
      buildingId: classroom.building.id,
      buildingName: classroom.building.name,
      centerId: classroom.building.center.id,
      centerName: classroom.building.center.name,
      status: conflicts.length
        ? 'occupied'
        : issues.size
          ? 'indeterminate'
          : 'available',
      dataStatus: issues.size ? 'partial' : 'complete',
      conflictCount: conflicts.length,
      conflicts,
      scheduleIssues: [...issues.values()],
    };
  }

  private isInsideScope(scope: AnalyticsEffectiveScope, occupancy: Occupancy) {
    const report = occupancy.teachingSession.assignmentReport;
    return scope.branches.some((branch) => {
      if (branch.type === 'global') return true;
      if (branch.type === 'teacher')
        return branch.teacherId === report.teacherId;
      return branch.centerDepartmentIds.includes(report.centerDepartmentId);
    });
  }

  private sortRows(
    rows: ClassroomAvailabilityRow[],
    sort: ClassroomAvailabilityExportDto['sort'],
  ) {
    const [field, order] = (sort ?? 'classroomName:asc').split(':') as [
      'status' | 'classroomName' | 'buildingName',
      'asc' | 'desc',
    ];
    const direction = order === 'asc' ? 1 : -1;
    rows.sort(
      (left, right) =>
        left[field].localeCompare(right[field], 'es') * direction ||
        left.classroomId.localeCompare(right.classroomId),
    );
  }

  private coverage(
    rows: ClassroomAvailabilityRow[],
    included: number,
    total: number,
  ): AnalyticsCoverage {
    const reasons = new Set<AnalyticsCoverageReason>();
    for (const row of rows) {
      for (const issue of row.scheduleIssues) reasons.add(issue.reason);
    }
    return {
      included,
      total,
      excluded: total - included,
      reasons: [...reasons],
    };
  }

  private metric(
    key: string,
    value: number,
    dataStatus: AnalyticsMetricResult['dataStatus'],
    coverage?: AnalyticsCoverage,
    notes?: AnalyticsMetricResult['notes'],
  ): AnalyticsMetricResult {
    return {
      key,
      value,
      unit: 'classrooms',
      dataStatus,
      ...(coverage ? { coverage } : {}),
      ...(notes ? { notes } : {}),
    };
  }
}
