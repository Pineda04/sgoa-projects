import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EnrollmentDetailsDto,
  EnrollmentExportDto,
  EnrollmentFiltersDto,
} from '../dto';
import {
  AnalyticsComparison,
  AnalyticsCoverage,
  AnalyticsCoverageReason,
  AnalyticsDataStatus,
  AnalyticsEffectiveScope,
  AnalyticsMetricResult,
  AnalyticsMetricNote,
  AnalyticsMetricUnit,
} from '../types';
import { analyticsScopeToCourseClassroomWhere } from '../utils';
import { AnalyticsScopeService } from './analytics-scope.service';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';

type EnrollmentSection = {
  id: string;
  groupCode: string;
  studentCount: number | null;
  modality: { name: string };
  course: { code: string; name: string };
  classroom: { id: string; name: string; maxCapacity: number | null };
  teachingSession: {
    assignmentReport: {
      teacher: { id: string; user: { name: string } };
    };
  };
};

type EnrollmentAggregate = {
  reportedEnrollments: number | null;
  averageEnrollmentPerSection: number | null;
  sectionsOverCapacity: number | null;
  availablePhysicalSeats: number | null;
  occupancyRate: number | null;
  enrollmentDataCoverage: number | null;
  enrollmentCoverage: AnalyticsCoverage;
  capacityCoverage: AnalyticsCoverage;
};

type EnrollmentMetricKey =
  | 'reportedEnrollments'
  | 'averageEnrollmentPerSection'
  | 'sectionsOverCapacity'
  | 'availablePhysicalSeats'
  | 'occupancyRate'
  | 'enrollmentDataCoverage';

export type EnrollmentDetailRow = {
  sectionId: string;
  courseCode: string;
  courseName: string;
  groupCode: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  studentCount: number | null;
  maxCapacity: number | null;
  occupancyRate: number | null;
  availableSeats: number | null;
  overCapacity: boolean | null;
};

type EnrollmentDetailsRuntimeInput = EnrollmentDetailsDto & {
  comparisonPeriodId?: string;
};

const CURRENT_CAPACITY_NOTES: AnalyticsMetricNote[] = [
  'current_classroom_capacity',
];
const VIRTUAL_MODALITY_NAME: string = EClassModality.VIRTUAL_SPACE;

@Injectable()
export class EnrollmentAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getSummary(userId: string, filters: EnrollmentFiltersDto) {
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
        : Promise.resolve(null),
    ]);
    const current = this.aggregate(currentSections);
    const comparison = comparisonSections
      ? this.aggregate(comparisonSections)
      : null;

    return {
      periodId: filters.periodId,
      comparisonPeriodId: filters.comparisonPeriodId ?? null,
      metrics: {
        reportedEnrollments: this.metric(
          'reportedEnrollments',
          current.reportedEnrollments,
          'enrollments',
          current.enrollmentCoverage,
          comparison?.reportedEnrollments,
          comparison?.enrollmentCoverage,
        ),
        averageEnrollmentPerSection: this.metric(
          'averageEnrollmentPerSection',
          current.averageEnrollmentPerSection,
          'enrollments',
          current.enrollmentCoverage,
          comparison?.averageEnrollmentPerSection,
          comparison?.enrollmentCoverage,
        ),
        sectionsOverCapacity: this.metric(
          'sectionsOverCapacity',
          current.sectionsOverCapacity,
          'sections',
          current.capacityCoverage,
          comparison?.sectionsOverCapacity,
          comparison?.capacityCoverage,
          CURRENT_CAPACITY_NOTES,
        ),
        availablePhysicalSeats: this.metric(
          'availablePhysicalSeats',
          current.availablePhysicalSeats,
          'capacity',
          current.capacityCoverage,
          comparison?.availablePhysicalSeats,
          comparison?.capacityCoverage,
          CURRENT_CAPACITY_NOTES,
        ),
        occupancyRate: this.metric(
          'occupancyRate',
          current.occupancyRate,
          'percentage',
          current.capacityCoverage,
          comparison?.occupancyRate,
          comparison?.capacityCoverage,
          CURRENT_CAPACITY_NOTES,
        ),
        enrollmentDataCoverage: this.metric(
          'enrollmentDataCoverage',
          current.enrollmentDataCoverage,
          'percentage',
          current.enrollmentCoverage,
          comparison?.enrollmentDataCoverage,
          comparison?.enrollmentCoverage,
        ),
      },
    };
  }

  async getDetails(userId: string, filters: EnrollmentDetailsDto) {
    this.rejectDetailsComparison(filters);
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

    const rows = await this.buildDetailRows(userId, filters);

    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      periodId: filters.periodId,
      notes: CURRENT_CAPACITY_NOTES,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: EnrollmentExportDto,
  ): Promise<EnrollmentDetailRow[]> {
    return this.buildDetailRows(userId, filters);
  }

  private async buildDetailRows(
    userId: string,
    filters: EnrollmentExportDto,
  ): Promise<EnrollmentDetailRow[]> {
    const scope = await this.resolveScope(userId, filters);
    await this.validatePeriods([filters.periodId]);
    const sections = await this.loadSections(scope, filters.periodId);
    // TODO: Measure realistic result sizes before moving sorting and pagination into SQL.
    const rows = this.deduplicate(sections).map((section) =>
      this.toDetailRow(section),
    );
    const [sortField, sortDirection] = (filters.sort ?? 'courseCode:asc').split(
      ':',
    ) as [
      (
        | 'courseCode'
        | 'teacherName'
        | 'classroomName'
        | 'studentCount'
        | 'occupancyRate'
      ),
      'asc' | 'desc',
    ];
    const direction = sortDirection === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = left[sortField];
      const rightValue = right[sortField];
      if (leftValue === null && rightValue !== null) return 1;
      if (leftValue !== null && rightValue === null) return -1;
      if (leftValue === null && rightValue === null) {
        return left.sectionId.localeCompare(right.sectionId);
      }

      const ordered =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), 'es');
      return (
        ordered * direction || left.sectionId.localeCompare(right.sectionId)
      );
    });

    return rows;
  }

  private async resolveScope(
    userId: string,
    filters: Pick<EnrollmentFiltersDto, 'centerDepartmentId' | 'teacherId'>,
  ) {
    const domainScope = await this.scopeService.getDomainScope(
      userId,
      'enrollment',
    );
    const scope = this.scopeService.intersectRequestedScope(domainScope, {
      ...(filters.centerDepartmentId
        ? { centerDepartmentIds: [filters.centerDepartmentId] }
        : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
    });
    if (!scope.branches.length) {
      throw new ForbiddenException(
        'El usuario no tiene alcance para analítica de matrícula.',
      );
    }

    if (filters.teacherId) {
      const allowedCenterIds = [
        ...new Set(
          scope.branches.flatMap((branch) =>
            branch.type === 'centerDepartments'
              ? branch.centerDepartmentIds
              : [],
          ),
        ),
      ];
      const ownTeacherBranch = scope.branches.some(
        (branch) =>
          branch.type === 'teacher' && branch.teacherId === filters.teacherId,
      );
      if (!ownTeacherBranch && allowedCenterIds.length) {
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
    filters: Pick<EnrollmentFiltersDto, 'periodId' | 'comparisonPeriodId'>,
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

  private rejectDetailsComparison(filters: EnrollmentDetailsRuntimeInput) {
    if (filters.comparisonPeriodId) {
      throw new BadRequestException(
        '<comparisonPeriodId> no está soportado en el detalle de matrícula.',
      );
    }
  }

  private loadSections(scope: AnalyticsEffectiveScope, periodId: string) {
    return this.prisma.courseClassroom.findMany({
      where: analyticsScopeToCourseClassroomWhere(scope, periodId),
      select: {
        id: true,
        groupCode: true,
        studentCount: true,
        modality: { select: { name: true } },
        course: { select: { code: true, name: true } },
        classroom: {
          select: { id: true, name: true, maxCapacity: true },
        },
        teachingSession: {
          select: {
            assignmentReport: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private deduplicate(sections: EnrollmentSection[]) {
    return [
      ...new Map(sections.map((section) => [section.id, section])).values(),
    ];
  }

  private aggregate(sections: EnrollmentSection[]): EnrollmentAggregate {
    const uniqueSections = this.deduplicate(sections);
    const total = uniqueSections.length;
    const physicalTotal = uniqueSections.filter(
      ({ modality }) => modality.name !== VIRTUAL_MODALITY_NAME,
    ).length;
    let knownEnrollment = 0;
    let reportedEnrollments = 0;
    let comparable = 0;
    let comparableEnrollment = 0;
    let comparableCapacity = 0;
    let sectionsOverCapacity = 0;
    let availablePhysicalSeats = 0;
    const enrollmentReasons = new Set<AnalyticsCoverageReason>();
    const capacityReasons = new Set<AnalyticsCoverageReason>();

    for (const section of uniqueSections) {
      if (section.studentCount === null) {
        enrollmentReasons.add('missing_enrollment');
        capacityReasons.add('missing_enrollment');
      } else {
        knownEnrollment += 1;
        reportedEnrollments += section.studentCount;
      }

      if (section.modality.name === VIRTUAL_MODALITY_NAME) continue;

      const capacity = section.classroom.maxCapacity;
      if (capacity === null) {
        capacityReasons.add('missing_classroom_capacity');
      } else if (capacity <= 0) {
        capacityReasons.add('invalid_classroom_capacity');
      }

      if (section.studentCount !== null && capacity !== null && capacity > 0) {
        comparable += 1;
        comparableEnrollment += section.studentCount;
        comparableCapacity += capacity;
        if (section.studentCount > capacity) sectionsOverCapacity += 1;
        availablePhysicalSeats += Math.max(0, capacity - section.studentCount);
      }
    }

    return {
      reportedEnrollments:
        total === 0 ? 0 : knownEnrollment ? reportedEnrollments : null,
      averageEnrollmentPerSection: knownEnrollment
        ? reportedEnrollments / knownEnrollment
        : null,
      sectionsOverCapacity:
        total === 0 ? 0 : comparable ? sectionsOverCapacity : null,
      availablePhysicalSeats:
        total === 0 ? 0 : comparable ? availablePhysicalSeats : null,
      occupancyRate:
        comparableCapacity > 0
          ? (comparableEnrollment / comparableCapacity) * 100
          : null,
      enrollmentDataCoverage:
        total > 0 ? (knownEnrollment / total) * 100 : null,
      enrollmentCoverage: this.coverage(
        knownEnrollment,
        total,
        enrollmentReasons,
      ),
      capacityCoverage: this.coverage(
        comparable,
        physicalTotal,
        capacityReasons,
      ),
    };
  }

  private coverage(
    included: number,
    total: number,
    reasons: Set<AnalyticsCoverageReason>,
  ): AnalyticsCoverage {
    const reasonOrder: AnalyticsCoverageReason[] = [
      'missing_enrollment',
      'missing_classroom_capacity',
      'invalid_classroom_capacity',
    ];
    return {
      included,
      total,
      excluded: total - included,
      reasons: reasonOrder.filter((reason) => reasons.has(reason)),
    };
  }

  private metric(
    key: EnrollmentMetricKey,
    value: number | null,
    unit: AnalyticsMetricUnit,
    coverage: AnalyticsCoverage,
    comparisonValue: number | null | undefined,
    comparisonCoverage: AnalyticsCoverage | undefined,
    notes?: AnalyticsMetricNote[],
  ): AnalyticsMetricResult {
    const dataStatus = this.dataStatus(key, value, coverage);
    return {
      key,
      value,
      unit,
      dataStatus,
      coverage,
      ...(notes ? { notes } : {}),
      comparison:
        comparisonValue === undefined || comparisonCoverage === undefined
          ? null
          : this.comparison(
              value,
              comparisonValue,
              dataStatus,
              this.dataStatus(key, comparisonValue, comparisonCoverage),
              coverage,
              comparisonCoverage,
            ),
    };
  }

  private dataStatus(
    key: EnrollmentMetricKey,
    value: number | null,
    coverage: AnalyticsCoverage,
  ): AnalyticsDataStatus {
    if (coverage.total === 0) {
      return key === 'reportedEnrollments' ||
        key === 'sectionsOverCapacity' ||
        key === 'availablePhysicalSeats'
        ? 'complete'
        : 'not_applicable';
    }
    if (value === null || coverage.included === 0) return 'unavailable';
    return coverage.excluded === 0 ? 'complete' : 'partial';
  }

  private comparison(
    current: number | null,
    comparison: number | null,
    currentDataStatus: AnalyticsDataStatus,
    comparisonDataStatus: AnalyticsDataStatus,
    currentCoverage: AnalyticsCoverage,
    comparisonCoverage: AnalyticsCoverage,
  ): AnalyticsComparison {
    if (current === null || comparison === null) {
      return {
        current,
        comparison,
        absoluteChange: null,
        percentageChange: null,
        currentDataStatus,
        comparisonDataStatus,
        currentCoverage,
        comparisonCoverage,
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
      currentCoverage,
      comparisonCoverage,
    };
  }

  private toDetailRow(section: EnrollmentSection): EnrollmentDetailRow {
    const teacher = section.teachingSession.assignmentReport.teacher;
    const capacity = section.classroom.maxCapacity;
    const isComparable =
      section.modality.name !== VIRTUAL_MODALITY_NAME &&
      section.studentCount !== null &&
      capacity !== null &&
      capacity > 0;
    return {
      sectionId: section.id,
      courseCode: section.course.code,
      courseName: section.course.name,
      groupCode: section.groupCode,
      teacherId: teacher.id,
      teacherName: teacher.user.name,
      classroomId: section.classroom.id,
      classroomName: section.classroom.name,
      studentCount: section.studentCount,
      maxCapacity: capacity,
      occupancyRate: isComparable
        ? (section.studentCount! / capacity) * 100
        : null,
      availableSeats: isComparable
        ? Math.max(0, capacity - section.studentCount!)
        : null,
      overCapacity: isComparable ? section.studentCount! > capacity : null,
    };
  }
}
