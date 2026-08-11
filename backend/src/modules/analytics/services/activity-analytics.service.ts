import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ActivityDetailsDto,
  ActivityExportDto,
  ActivityFiltersDto,
} from '../dto';
import { AnalyticsEffectiveScope } from '../types';
import { AnalyticsScopeService } from './analytics-scope.service';

type PeriodSource = {
  id: string;
  year: number;
  pac: number;
  pac_modality: string;
};

type ReportSource = {
  id: string;
  teacher: { id: string; user: { name: string; code: string } };
  period: PeriodSource;
  centerDepartment: {
    id: string;
    center: { name: string };
    department: { name: string };
  };
  complementaryActivities: {
    id: string;
    name: string;
    progressLevel: string;
    isRegistered: boolean | null;
    activityType: { id: string; name: string };
  }[];
};

export type ActivityDetailRow = {
  id: string;
  activityName: string;
  progressLevel: string;
  isRegistered: boolean | null;
  activityType: { id: string; name: string };
  teacher: { id: string; name: string; code: string };
  assignmentReportId: string;
  period: {
    id: string;
    year: number;
    pac: number;
    pacModality: string;
    label: string;
  };
  centerDepartment: {
    id: string;
    centerName: string;
    departmentName: string;
    label: string;
  };
};

type DistributionItem = {
  id: string;
  label: string;
  value: number;
  percentage: number;
};

type TemporalScope =
  | { type: 'period'; periodId: string }
  | {
      type: 'year';
      year: number;
      pac?: number;
      pacModality?: string;
    };

@Injectable()
export class ActivityAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getSummary(userId: string, filters: ActivityFiltersDto) {
    const { scope, temporalScope, periods } = await this.resolveAndValidate(
      userId,
      filters,
    );
    const [reports, activityTypes, activeTeacherIds] = await Promise.all([
      this.loadReports(scope, periods, filters.activityTypeId),
      this.prisma.activityType.findMany({
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
      this.loadActiveTeacherIds(scope),
    ]);
    const rows = this.rowsFromReports(reports);
    const total = rows.length;
    const reportedTeacherIds = new Set(
      reports.map(({ teacher }) => teacher.id),
    );
    const activeIds = new Set(activeTeacherIds.map(({ id }) => id));
    const activeWithReport = [...reportedTeacherIds].filter((id) =>
      activeIds.has(id),
    ).length;
    const denominator = activeIds.size;

    return {
      temporalScope,
      notes: [
        'current_activity_type_catalog',
        'assignment_reports_without_workflow',
      ] as const,
      metrics: {
        totalActivities: {
          key: 'totalActivities',
          value: total,
          unit: 'activities',
          dataStatus: 'complete',
        },
        reportedTeachers: {
          key: 'reportedTeachers',
          value: reportedTeacherIds.size,
          unit: 'teachers',
          dataStatus: 'complete',
        },
        averageActivitiesPerReportedTeacher: {
          key: 'averageActivitiesPerReportedTeacher',
          value: reportedTeacherIds.size
            ? total / reportedTeacherIds.size
            : null,
          unit: 'activities',
          dataStatus: reportedTeacherIds.size ? 'complete' : 'unavailable',
          numerator: total,
          denominator: reportedTeacherIds.size,
        },
        activeTeacherReportCoverage: {
          key: 'activeTeacherReportCoverage',
          value: denominator ? (activeWithReport / denominator) * 100 : null,
          unit: 'percentage',
          dataStatus: !denominator
            ? 'unavailable'
            : activeWithReport < denominator
              ? 'partial'
              : 'complete',
          numerator: activeWithReport,
          denominator,
          coverage: {
            included: activeWithReport,
            total: denominator,
            excluded: denominator - activeWithReport,
            reasons:
              activeWithReport < denominator
                ? (['missing_assignment_report'] as const)
                : [],
          },
        },
      },
      distributions: {
        byType: this.typeDistribution(rows, activityTypes),
        byPeriod: this.periodDistribution(rows, periods),
        byCenterDepartment: this.distribution(rows, (row) => ({
          id: row.centerDepartment.id,
          label: row.centerDepartment.label,
        })),
        byTeacher: this.distribution(rows, (row) => ({
          id: row.teacher.id,
          label: `${row.teacher.code} - ${row.teacher.name}`,
        })),
      },
    };
  }

  async getDetails(userId: string, filters: ActivityDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    this.validatePagination(page, size);
    const { temporalScope, rows } = await this.buildRows(userId, filters);
    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      temporalScope,
      notes: [
        'current_activity_type_catalog',
        'assignment_reports_without_workflow',
      ] as const,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  async getExportRows(userId: string, filters: ActivityExportDto) {
    return (await this.buildRows(userId, filters)).rows;
  }

  private async buildRows(userId: string, filters: ActivityExportDto) {
    const { scope, temporalScope, periods } = await this.resolveAndValidate(
      userId,
      filters,
    );
    const reports = await this.loadReports(
      scope,
      periods,
      filters.activityTypeId,
    );
    const rows = this.rowsFromReports(reports);
    const [field, order] = (filters.sort ?? 'activityName:asc').split(':') as [
      'activityName' | 'typeName' | 'teacherName' | 'period' | 'progressLevel',
      'asc' | 'desc',
    ];
    const value = (row: ActivityDetailRow) => {
      if (field === 'typeName') return row.activityType.name;
      if (field === 'teacherName') return row.teacher.name;
      if (field === 'period') {
        return `${row.period.year.toString().padStart(4, '0')}-${row.period.pac.toString().padStart(4, '0')}-${row.period.pacModality}`;
      }
      return row[field];
    };
    const direction = order === 'asc' ? 1 : -1;
    rows.sort(
      (left, right) =>
        value(left).localeCompare(value(right), 'es') * direction ||
        left.id.localeCompare(right.id),
    );
    return { temporalScope, rows };
  }

  private async resolveAndValidate(
    userId: string,
    filters: ActivityFiltersDto,
  ) {
    const temporalScope = this.validateTemporalFilters(filters);
    const domainScope = await this.scopeService.getDomainScope(
      userId,
      'activities',
    );
    const scope = this.scopeService.intersectRequestedScope(domainScope, {
      ...(filters.centerDepartmentId
        ? { centerDepartmentIds: [filters.centerDepartmentId] }
        : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
    });
    if (!scope.branches.length) {
      throw new ForbiddenException(
        'El usuario no tiene alcance para actividades.',
      );
    }

    const [center, activityType, periods] = await Promise.all([
      filters.centerDepartmentId
        ? this.prisma.centerDepartment.findUnique({
            where: { id: filters.centerDepartmentId },
            select: { id: true },
          })
        : null,
      filters.activityTypeId
        ? this.prisma.activityType.findUnique({
            where: { id: filters.activityTypeId },
            select: { id: true },
          })
        : null,
      this.loadPeriods(temporalScope),
    ]);
    if (
      (filters.centerDepartmentId && !center) ||
      (filters.activityTypeId && !activityType)
    ) {
      throw new NotFoundException(
        'Uno o más filtros de actividades no existen.',
      );
    }
    if (temporalScope.type === 'period' && !periods.length) {
      throw new NotFoundException('El período académico no existe.');
    }

    if (filters.teacherId) {
      const report = await this.prisma.academicAssignmentReport.findFirst({
        where: {
          teacherId: filters.teacherId,
          ...this.reportsScopeWhere(scope),
        },
        select: { id: true },
      });
      if (!report) {
        throw new ForbiddenException(
          'El docente solicitado está fuera del alcance de Analytics.',
        );
      }
    }
    return { scope, temporalScope, periods };
  }

  private validateTemporalFilters(filters: ActivityFiltersDto): TemporalScope {
    const hasPeriod = Boolean(filters.periodId);
    const hasYear = Boolean(filters.year);
    if (hasPeriod === hasYear) {
      throw new BadRequestException(
        'Debe enviar exactamente uno de <periodId> o <year>.',
      );
    }
    if (hasPeriod && (filters.pac || filters.pacModality)) {
      throw new BadRequestException(
        '<pac> y <pacModality> solo se permiten junto con <year>.',
      );
    }
    if (filters.pac && !filters.pacModality) {
      throw new BadRequestException(
        '<pacModality> es obligatorio cuando se envía <pac>.',
      );
    }
    if (filters.pacModality && !filters.pac) {
      throw new BadRequestException('<pacModality> no se permite sin <pac>.');
    }
    if (filters.periodId) return { type: 'period', periodId: filters.periodId };
    return {
      type: 'year',
      year: Number(filters.year),
      ...(filters.pac ? { pac: Number(filters.pac) } : {}),
      ...(filters.pacModality ? { pacModality: filters.pacModality } : {}),
    };
  }

  private loadPeriods(scope: TemporalScope): Promise<PeriodSource[]> {
    return this.prisma.academicPeriod.findMany({
      where:
        scope.type === 'period'
          ? { id: scope.periodId }
          : {
              year: scope.year,
              ...(scope.pac !== undefined ? { pac: scope.pac } : {}),
              ...(scope.pacModality ? { pac_modality: scope.pacModality } : {}),
            },
      select: { id: true, year: true, pac: true, pac_modality: true },
      orderBy: [{ year: 'asc' }, { pac: 'asc' }, { pac_modality: 'asc' }],
    });
  }

  private loadReports(
    scope: AnalyticsEffectiveScope,
    periods: PeriodSource[],
    activityTypeId?: string,
  ): Promise<ReportSource[]> {
    return this.prisma.academicAssignmentReport.findMany({
      where: {
        ...this.reportsScopeWhere(scope),
        periodId: { in: periods.map(({ id }) => id) },
      },
      select: {
        id: true,
        teacher: {
          select: {
            id: true,
            user: { select: { name: true, code: true } },
          },
        },
        period: {
          select: { id: true, year: true, pac: true, pac_modality: true },
        },
        centerDepartment: {
          select: {
            id: true,
            center: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
        complementaryActivities: {
          where: activityTypeId ? { activityTypeId } : {},
          select: {
            id: true,
            name: true,
            progressLevel: true,
            isRegistered: true,
            activityType: { select: { id: true, name: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  private reportsScopeWhere(scope: AnalyticsEffectiveScope) {
    const global = scope.branches.find(({ type }) => type === 'global');
    if (global?.type === 'global') {
      return {
        ...(global.teacherId ? { teacherId: global.teacherId } : {}),
        ...(global.centerDepartmentIds
          ? { centerDepartmentId: { in: global.centerDepartmentIds } }
          : {}),
      };
    }
    return {
      OR: scope.branches.map((branch) =>
        branch.type === 'teacher'
          ? { teacherId: branch.teacherId }
          : {
              ...(branch.teacherId ? { teacherId: branch.teacherId } : {}),
              centerDepartmentId: { in: branch.centerDepartmentIds },
            },
      ),
    };
  }

  private loadActiveTeacherIds(scope: AnalyticsEffectiveScope) {
    const now = new Date();
    const global = scope.branches.find(({ type }) => type === 'global');
    const where =
      global?.type === 'global'
        ? {
            ...(global.teacherId ? { id: global.teacherId } : {}),
            ...(global.centerDepartmentIds
              ? {
                  positionHeld: {
                    some: {
                      centerDepartmentId: { in: global.centerDepartmentIds },
                      startDate: { lte: now },
                      OR: [{ endDate: null }, { endDate: { gte: now } }],
                    },
                  },
                }
              : {}),
          }
        : {
            OR: scope.branches.map((branch) =>
              branch.type === 'teacher'
                ? { id: branch.teacherId }
                : {
                    ...(branch.teacherId ? { id: branch.teacherId } : {}),
                    positionHeld: {
                      some: {
                        centerDepartmentId: { in: branch.centerDepartmentIds },
                        startDate: { lte: now },
                        OR: [{ endDate: null }, { endDate: { gte: now } }],
                      },
                    },
                  },
            ),
          };
    return this.prisma.teacher.findMany({
      where: { user: { activeStatus: true }, ...where },
      select: { id: true },
    });
  }

  private rowsFromReports(reports: ReportSource[]): ActivityDetailRow[] {
    // TODO: Keep aggregation in memory until measurements justify a database-level alternative.
    return reports.flatMap((report) =>
      report.complementaryActivities.map((activity) => ({
        id: activity.id,
        activityName: activity.name,
        progressLevel: activity.progressLevel,
        isRegistered: activity.isRegistered,
        activityType: activity.activityType,
        teacher: {
          id: report.teacher.id,
          name: report.teacher.user.name,
          code: report.teacher.user.code,
        },
        assignmentReportId: report.id,
        period: {
          id: report.period.id,
          year: report.period.year,
          pac: report.period.pac,
          pacModality: report.period.pac_modality,
          label: this.periodLabel(report.period),
        },
        centerDepartment: {
          id: report.centerDepartment.id,
          centerName: report.centerDepartment.center.name,
          departmentName: report.centerDepartment.department.name,
          label: `${report.centerDepartment.center.name} - ${report.centerDepartment.department.name}`,
        },
      })),
    );
  }

  private typeDistribution(
    rows: ActivityDetailRow[],
    types: { id: string; name: string }[],
  ) {
    const counts = this.countDistinct(rows, (row) => row.activityType.id);
    return types.map((type) => ({
      id: type.id,
      label: type.name,
      value: counts.get(type.id)?.size ?? 0,
      percentage: rows.length
        ? ((counts.get(type.id)?.size ?? 0) / rows.length) * 100
        : 0,
    }));
  }

  private periodDistribution(
    rows: ActivityDetailRow[],
    periods: PeriodSource[],
  ) {
    const counts = this.countDistinct(rows, (row) => row.period.id);
    return periods.map((period) => ({
      id: period.id,
      label: this.periodLabel(period),
      value: counts.get(period.id)?.size ?? 0,
      percentage: rows.length
        ? ((counts.get(period.id)?.size ?? 0) / rows.length) * 100
        : 0,
    }));
  }

  private distribution(
    rows: ActivityDetailRow[],
    select: (row: ActivityDetailRow) => { id: string; label: string },
  ): DistributionItem[] {
    const labels = new Map<string, string>();
    const counts = this.countDistinct(rows, (row) => {
      const item = select(row);
      labels.set(item.id, item.label);
      return item.id;
    });
    return [...counts.entries()]
      .map(([id, activityIds]) => ({
        id,
        label: labels.get(id) ?? id,
        value: activityIds.size,
        percentage: rows.length ? (activityIds.size / rows.length) * 100 : 0,
      }))
      .sort(
        (left, right) =>
          left.label.localeCompare(right.label, 'es') ||
          left.id.localeCompare(right.id),
      );
  }

  private countDistinct(
    rows: ActivityDetailRow[],
    key: (row: ActivityDetailRow) => string,
  ) {
    const counts = new Map<string, Set<string>>();
    for (const row of rows) {
      const id = key(row);
      const values = counts.get(id) ?? new Set<string>();
      values.add(row.id);
      counts.set(id, values);
    }
    return counts;
  }

  private periodLabel(period: PeriodSource) {
    return `No. ${period.pac}, ${period.pac_modality}, ${period.year}`;
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
}
