import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  COURSE_CLASSROOM_DAY_CODES,
  parseCourseClassroomDays,
  parseCourseClassroomSection,
} from 'src/common/utils/course-classroom-schedule.util';
import {
  AcademicLoadDetailsDto,
  AcademicLoadExportDto,
  AcademicLoadFiltersDto,
} from '../dto';
import {
  AnalyticsComparison,
  AnalyticsEffectiveScope,
  AnalyticsMetricResult,
} from '../types';
import { analyticsScopeToCourseClassroomWhere } from '../utils';
import { AnalyticsScopeService } from './analytics-scope.service';

type Section = {
  id: string;
  days: string;
  section: string;
  course: { id: string; uvs: number };
  teachingSession: {
    assignmentReport: {
      teacher: { id: string; user: { name: string; code: string } };
    };
  };
};

export type AcademicLoadDetailRow = {
  teacherId: string;
  name: string;
  code: string;
  sectionCount: number;
  distinctCourseCount: number;
  assignedUvs: number;
};

@Injectable()
export class AcademicLoadAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getSummary(userId: string, filters: AcademicLoadFiltersDto) {
    this.validateComparisonPeriod(filters);
    const scope = await this.resolveScope(userId, filters);
    await this.validatePeriods(
      [filters.periodId, filters.comparisonPeriodId].filter(
        (id): id is string => Boolean(id),
      ),
    );
    const [currentSections, comparisonSections] = await Promise.all([
      this.loadSections(scope, filters.periodId),
      filters.comparisonPeriodId
        ? this.loadSections(scope, filters.comparisonPeriodId)
        : Promise.resolve(undefined),
    ]);
    const current = this.aggregate(currentSections);
    const comparison = comparisonSections
      ? this.aggregate(comparisonSections)
      : undefined;

    return {
      periodId: filters.periodId,
      comparisonPeriodId: filters.comparisonPeriodId ?? null,
      metrics: {
        offeredSections: this.metric(
          'offeredSections',
          current.offeredSections,
          'sections',
          comparison
            ? this.comparison(
                current.offeredSections,
                comparison.offeredSections,
              )
            : undefined,
        ),
        distinctCourses: this.metric(
          'distinctCourses',
          current.distinctCourses,
          'courses',
          comparison
            ? this.comparison(
                current.distinctCourses,
                comparison.distinctCourses,
              )
            : undefined,
        ),
        assignedUvs: this.metric(
          'assignedUvs',
          current.assignedUvs,
          'uv',
          comparison
            ? this.comparison(current.assignedUvs, comparison.assignedUvs)
            : undefined,
        ),
        assignedTeachers: this.metric(
          'assignedTeachers',
          current.assignedTeachers,
          'teachers',
          comparison
            ? this.comparison(
                current.assignedTeachers,
                comparison.assignedTeachers,
              )
            : undefined,
        ),
        averageSectionsPerTeacher: this.metric(
          'averageSectionsPerTeacher',
          current.averageSectionsPerTeacher,
          'sections',
          comparison
            ? this.comparison(
                current.averageSectionsPerTeacher,
                comparison.averageSectionsPerTeacher,
              )
            : undefined,
        ),
        averageUvsPerTeacher: this.metric(
          'averageUvsPerTeacher',
          current.averageUvsPerTeacher,
          'uv',
          comparison
            ? this.comparison(
                current.averageUvsPerTeacher,
                comparison.averageUvsPerTeacher,
              )
            : undefined,
        ),
      },
      scheduleDistribution: this.scheduleDistribution(currentSections),
    };
  }

  async getDetails(userId: string, filters: AcademicLoadDetailsDto) {
    this.validateComparisonPeriod(filters);
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
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

    const periodIds = [filters.periodId, filters.comparisonPeriodId].filter(
      (id): id is string => Boolean(id),
    );
    const rows = await this.buildDetailRows(userId, filters, periodIds);

    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: AcademicLoadExportDto,
  ): Promise<AcademicLoadDetailRow[]> {
    return this.buildDetailRows(userId, filters, [filters.periodId]);
  }

  private async buildDetailRows(
    userId: string,
    filters: AcademicLoadExportDto,
    periodIdsToValidate: string[],
  ): Promise<AcademicLoadDetailRow[]> {
    const scope = await this.resolveScope(userId, filters);
    await this.validatePeriods(periodIdsToValidate);
    const sections = await this.loadSections(scope, filters.periodId);
    // TODO: Keep aggregation in memory until measurements justify a database-level alternative.
    const rowsByTeacher = new Map<
      string,
      {
        teacherId: string;
        name: string;
        code: string;
        sectionIds: Set<string>;
        courseIds: Set<string>;
        assignedUvs: number;
      }
    >();

    for (const section of this.deduplicate(sections)) {
      const teacher = section.teachingSession.assignmentReport.teacher;
      const row = rowsByTeacher.get(teacher.id) ?? {
        teacherId: teacher.id,
        name: teacher.user.name,
        code: teacher.user.code,
        sectionIds: new Set<string>(),
        courseIds: new Set<string>(),
        assignedUvs: 0,
      };
      row.sectionIds.add(section.id);
      row.courseIds.add(section.course.id);
      row.assignedUvs += section.course.uvs;
      rowsByTeacher.set(teacher.id, row);
    }

    const rows: AcademicLoadDetailRow[] = [...rowsByTeacher.values()].map(
      (row) => ({
        teacherId: row.teacherId,
        name: row.name,
        code: row.code,
        sectionCount: row.sectionIds.size,
        distinctCourseCount: row.courseIds.size,
        assignedUvs: row.assignedUvs,
      }),
    );
    const [sortField, sortDirection] = (filters.sort ?? 'name:asc').split(
      ':',
    ) as [keyof (typeof rows)[number], 'asc' | 'desc'];
    const direction = sortDirection === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = left[sortField];
      const rightValue = right[sortField];
      const comparison =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), 'es');
      return (
        comparison * direction || left.teacherId.localeCompare(right.teacherId)
      );
    });

    return rows;
  }

  private async resolveScope(
    userId: string,
    filters: Pick<AcademicLoadFiltersDto, 'centerDepartmentId' | 'teacherId'>,
  ) {
    const domainScope = await this.scopeService.getDomainScope(
      userId,
      'academic-load',
    );
    const scope = this.scopeService.intersectRequestedScope(domainScope, {
      ...(filters.centerDepartmentId
        ? { centerDepartmentIds: [filters.centerDepartmentId] }
        : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
    });
    if (!scope.branches.length) {
      throw new ForbiddenException(
        'El usuario no tiene alcance para carga académica.',
      );
    }

    if (filters.teacherId) {
      const coordinatorBranches = scope.branches.filter(
        (branch) => branch.type === 'centerDepartments',
      );
      const teacherBranch = scope.branches.some(
        (branch) =>
          branch.type === 'teacher' && branch.teacherId === filters.teacherId,
      );
      if (!teacherBranch && coordinatorBranches.length) {
        const allowedCenterIds = [
          ...new Set(
            coordinatorBranches.flatMap((branch) =>
              branch.type === 'centerDepartments'
                ? branch.centerDepartmentIds
                : [],
            ),
          ),
        ];
        const assignment = await this.prisma.academicAssignmentReport.findFirst(
          {
            where: {
              teacherId: filters.teacherId,
              centerDepartmentId: { in: allowedCenterIds },
            },
            select: { id: true },
          },
        );
        if (!assignment) {
          throw new ForbiddenException(
            'El docente solicitado está fuera del alcance de Analytics.',
          );
        }
      }
    }

    return scope;
  }

  private async validatePeriods(periodIds: string[]) {
    const uniqueIds = [...new Set(periodIds)];
    const periods = await this.prisma.academicPeriod.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (periods.length !== uniqueIds.length) {
      throw new NotFoundException('Uno o más períodos académicos no existen.');
    }
  }

  private validateComparisonPeriod(
    filters: Pick<AcademicLoadFiltersDto, 'periodId' | 'comparisonPeriodId'>,
  ) {
    if (
      filters.comparisonPeriodId &&
      filters.comparisonPeriodId === filters.periodId
    ) {
      throw new BadRequestException(
        '<comparisonPeriodId> debe ser diferente de <periodId>.',
      );
    }
  }

  private loadSections(scope: AnalyticsEffectiveScope, periodId: string) {
    return this.prisma.courseClassroom.findMany({
      where: analyticsScopeToCourseClassroomWhere(scope, periodId),
      select: {
        id: true,
        days: true,
        section: true,
        course: { select: { id: true, uvs: true } },
        teachingSession: {
          select: {
            assignmentReport: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    user: { select: { name: true, code: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private deduplicate(sections: Section[]) {
    return [
      ...new Map(sections.map((section) => [section.id, section])).values(),
    ];
  }

  private aggregate(sections: Section[]) {
    const uniqueSections = this.deduplicate(sections);
    const courseIds = new Set<string>();
    const teacherIds = new Set<string>();
    let assignedUvs = 0;

    for (const section of uniqueSections) {
      courseIds.add(section.course.id);
      teacherIds.add(section.teachingSession.assignmentReport.teacher.id);
      assignedUvs += section.course.uvs;
    }

    const assignedTeachers = teacherIds.size;
    return {
      offeredSections: uniqueSections.length,
      distinctCourses: courseIds.size,
      assignedUvs,
      assignedTeachers,
      averageSectionsPerTeacher: assignedTeachers
        ? uniqueSections.length / assignedTeachers
        : null,
      averageUvsPerTeacher: assignedTeachers
        ? assignedUvs / assignedTeachers
        : null,
    };
  }

  private scheduleDistribution(sections: Section[]) {
    const uniqueSections = this.deduplicate(sections);
    const meetings = new Map<
      string,
      {
        dayOfWeek: (typeof COURSE_CLASSROOM_DAY_CODES)[number];
        startTime: string;
        endTime: string;
        meetingCount: number;
      }
    >();
    const reasons = new Set<
      'invalid_schedule_days' | 'invalid_schedule_section'
    >();
    let included = 0;

    for (const courseClassroom of uniqueSections) {
      const days = parseCourseClassroomDays(courseClassroom.days);
      const schedule = parseCourseClassroomSection(courseClassroom.section);
      if (!days) reasons.add('invalid_schedule_days');
      if (!schedule) reasons.add('invalid_schedule_section');
      if (!days || !schedule) continue;

      included += 1;
      for (const dayOfWeek of days) {
        const key = `${dayOfWeek}:${schedule.startTime}:${schedule.endTime}`;
        const item = meetings.get(key);
        if (item) item.meetingCount += 1;
        else {
          meetings.set(key, {
            dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            meetingCount: 1,
          });
        }
      }
    }

    const total = uniqueSections.length;
    const coverageReasons = (
      ['invalid_schedule_days', 'invalid_schedule_section'] as const
    ).filter((reason) => reasons.has(reason));
    const dayOrder = new Map(
      COURSE_CLASSROOM_DAY_CODES.map((day, index) => [day, index]),
    );
    return {
      items: [...meetings.values()].sort(
        (left, right) =>
          dayOrder.get(left.dayOfWeek)! - dayOrder.get(right.dayOfWeek)! ||
          left.startTime.localeCompare(right.startTime) ||
          left.endTime.localeCompare(right.endTime),
      ),
      coverage: {
        included,
        total,
        excluded: total - included,
        reasons: coverageReasons,
      },
      dataStatus:
        total === 0 || included === total
          ? ('complete' as const)
          : included === 0
            ? ('unavailable' as const)
            : ('partial' as const),
    };
  }

  private comparison(
    current: number | null,
    comparison: number | null,
  ): AnalyticsComparison {
    const currentDataStatus =
      current === null ? ('unavailable' as const) : ('complete' as const);
    const comparisonDataStatus =
      comparison === null ? ('unavailable' as const) : ('complete' as const);
    if (current === null || comparison === null) {
      return {
        current,
        comparison,
        absoluteChange: null,
        percentageChange: null,
        currentDataStatus,
        comparisonDataStatus,
      };
    }

    return {
      current,
      comparison,
      absoluteChange: current - comparison,
      percentageChange: comparison
        ? ((current - comparison) / comparison) * 100
        : null,
      currentDataStatus,
      comparisonDataStatus,
    };
  }

  private metric(
    key: string,
    value: number | null,
    unit: AnalyticsMetricResult['unit'],
    comparison?: AnalyticsComparison,
  ): AnalyticsMetricResult {
    return {
      key,
      value,
      unit,
      dataStatus: value === null ? 'unavailable' : 'complete',
      ...(comparison ? { comparison } : {}),
    };
  }
}
