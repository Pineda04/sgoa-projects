import { Injectable } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsDomainScope, AnalyticsEffectiveScope } from '../types';
import { AnalyticsScopeService } from './analytics-scope.service';
import { EPosition } from 'src/modules/teachers-config/enums';

type FilterMode = 'hidden' | 'locked' | 'selectable';
type CenterDepartmentOptionSource = {
  id: string;
  center: { name: string };
  department: { name: string };
};
type TeacherOptionSource = {
  teacher: {
    id: string;
    user: { name: string; code: string };
  };
};
type ActiveTeacherOptionSource = TeacherOptionSource['teacher'];
type DomainFilterContext = {
  filters: {
    centerDepartmentId: FilterMode;
    teacherId: FilterMode;
  };
  defaults: {
    centerDepartmentId: string | null;
    teacherId: string | null;
  };
  options: {
    centerDepartments: {
      id: string;
      label: string;
      centerName: string;
      departmentName: string;
    }[];
    teachers: {
      id: string;
      label: string;
      name: string;
      code: string;
    }[];
  };
};

@Injectable()
export class AnalyticsFilterOptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getOptions(
    userId: string,
    requestedCenterDepartmentId?: string,
    requestedBuildingId?: string,
  ) {
    const scopes = await this.scopeService.getDomainScopes(userId);
    const domains = scopes
      .filter(({ branches }) => branches.length > 0)
      .map(({ domain }) => domain);
    const academicScope = this.findScope(scopes, 'academic-load');
    const enrollmentScope = this.findScope(scopes, 'enrollment');
    const classroomsScope = this.findScope(scopes, 'classrooms');
    const technologyScope = this.findScope(scopes, 'technology');
    const staffScope = this.findScope(scopes, 'staff');
    const activitiesScope = this.findScope(scopes, 'activities');
    const monitoringScope = this.findScope(scopes, 'monitoring');

    const [
      periods,
      academicContext,
      enrollmentContext,
      classroomsContext,
      technologyContext,
      staffContext,
      activitiesContext,
      staffCatalogs,
      activityTypes,
      monitoringContext,
    ] = await Promise.all([
      domains.length
        ? this.prisma.academicPeriod.findMany({
            select: {
              id: true,
              year: true,
              pac: true,
              pac_modality: true,
              startDate: true,
              endDate: true,
            },
            orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
          })
        : Promise.resolve(
            [] as {
              id: string;
              year: number;
              pac: number;
              pac_modality: string;
              startDate: Date;
              endDate: Date;
            }[],
          ),
      academicScope.branches.length
        ? this.buildDomainContext(
            academicScope,
            requestedCenterDepartmentId,
            true,
          )
        : Promise.resolve(null),
      enrollmentScope.branches.length
        ? this.buildDomainContext(
            enrollmentScope,
            requestedCenterDepartmentId,
            false,
          )
        : Promise.resolve(null),
      classroomsScope.branches.length
        ? this.buildDomainContext(
            classroomsScope,
            requestedCenterDepartmentId,
            false,
            false,
          )
        : Promise.resolve(null),
      technologyScope.branches.length
        ? this.buildDomainContext(
            technologyScope,
            requestedCenterDepartmentId,
            false,
            false,
          )
        : Promise.resolve(null),
      staffScope.branches.length
        ? this.buildStaffContext(staffScope, requestedCenterDepartmentId)
        : Promise.resolve(null),
      activitiesScope.branches.length
        ? this.buildDomainContext(
            activitiesScope,
            requestedCenterDepartmentId,
            false,
          )
        : Promise.resolve(null),
      staffScope.branches.length
        ? Promise.all([
            this.prisma.contractType.findMany({
              select: { id: true, name: true },
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            this.prisma.teacherCategory.findMany({
              select: { id: true, name: true },
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            this.prisma.shift.findMany({
              select: { id: true, name: true },
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            this.prisma.position.findMany({
              select: { id: true, name: true },
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
          ])
        : Promise.resolve(null),
      activitiesScope.branches.length
        ? this.prisma.activityType.findMany({
            select: { id: true, name: true },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
          })
        : Promise.resolve(null),
      monitoringScope.branches.length
        ? this.buildMonitoringContext(monitoringScope, requestedBuildingId)
        : Promise.resolve(null),
    ]);

    const now = startOfDay(new Date());
    const defaultPeriod =
      periods.find(
        ({ startDate, endDate }) => startDate <= now && endDate >= now,
      ) ?? periods[0];
    const mode = (value: FilterMode) => value;

    return {
      domains,
      domainContexts: {
        ...(academicContext ? { 'academic-load': academicContext } : {}),
        ...(enrollmentContext ? { enrollment: enrollmentContext } : {}),
        ...(classroomsContext ? { classrooms: classroomsContext } : {}),
        ...(technologyContext ? { technology: technologyContext } : {}),
        ...(staffContext && staffCatalogs
          ? {
              staff: {
                ...staffContext,
                catalogs: {
                  contractTypes: staffCatalogs[0].map(({ id, name }) => ({
                    id,
                    label: name,
                  })),
                  categories: staffCatalogs[1].map(({ id, name }) => ({
                    id,
                    label: name,
                  })),
                  shifts: staffCatalogs[2].map(({ id, name }) => ({
                    id,
                    label: name,
                  })),
                  positions: staffCatalogs[3].map(({ id, name }) => ({
                    id,
                    label:
                      name === String(EPosition.NONE)
                        ? 'Sin cargo académico vigente'
                        : name,
                  })),
                },
              },
            }
          : {}),
        ...(activitiesContext && activityTypes
          ? {
              activities: {
                ...activitiesContext,
                catalogs: {
                  activityTypes: activityTypes.map(({ id, name }) => ({
                    id,
                    label: name,
                  })),
                  availableYears: [
                    ...new Set(periods.map(({ year }) => year)),
                  ].sort((left, right) => right - left),
                },
              },
            }
          : {}),
        ...(monitoringContext ? { monitoring: monitoringContext } : {}),
      },
      filters: {
        periodId: mode(domains.length ? 'selectable' : 'hidden'),
        comparisonPeriodId: mode(academicContext ? 'selectable' : 'hidden'),
        centerDepartmentId:
          academicContext?.filters.centerDepartmentId ?? mode('hidden'),
        teacherId: academicContext?.filters.teacherId ?? mode('hidden'),
      },
      defaults: {
        periodId: defaultPeriod?.id ?? null,
        comparisonPeriodId: null,
        centerDepartmentId:
          academicContext?.defaults.centerDepartmentId ?? null,
        teacherId: academicContext?.defaults.teacherId ?? null,
      },
      options: {
        periods: periods.map((period) => ({
          id: period.id,
          label: `No. ${period.pac}, ${period.pac_modality}, ${period.year}`,
          year: period.year,
          pac: period.pac,
          modality: period.pac_modality,
          startDate: period.startDate,
          endDate: period.endDate,
        })),
        centerDepartments: academicContext?.options.centerDepartments ?? [],
        teachers: academicContext?.options.teachers ?? [],
      },
      capabilities: {
        canComparePeriods: Boolean(academicContext) && periods.length > 1,
        canExport: Boolean(
          academicContext ||
            enrollmentContext ||
            classroomsContext ||
            technologyContext ||
            staffContext ||
            activitiesContext ||
            monitoringContext,
        ),
      },
    };
  }

  private findScope(
    scopes: AnalyticsDomainScope[],
    domain:
      | 'academic-load'
      | 'enrollment'
      | 'classrooms'
      | 'technology'
      | 'staff'
      | 'activities'
      | 'monitoring',
  ): AnalyticsDomainScope {
    return (
      scopes.find((scope) => scope.domain === domain) ?? {
        domain,
        branches: [],
      }
    );
  }

  private async buildMonitoringContext(
    scope: AnalyticsDomainScope,
    requestedBuildingId?: string,
  ) {
    const isGlobal = scope.branches.some((branch) => branch.type === 'global');
    const authorizedBuildingIds = [
      ...new Set(
        scope.branches.flatMap((branch) =>
          branch.type === 'buildings' ? branch.buildingIds : [],
        ),
      ),
    ];
    const effective = this.scopeService.intersectRequestedScope(
      scope,
      requestedBuildingId ? { buildingIds: [requestedBuildingId] } : {},
    );
    const effectiveBuildingIds = isGlobal
      ? requestedBuildingId
        ? [requestedBuildingId]
        : undefined
      : [
          ...new Set(
            effective.branches.flatMap((branch) =>
              branch.type === 'buildings' ? branch.buildingIds : [],
            ),
          ),
        ];
    const [buildings, reports] = await Promise.all([
      this.prisma.building.findMany({
        where: isGlobal ? {} : { id: { in: authorizedBuildingIds } },
        select: {
          id: true,
          name: true,
          centerId: true,
          center: { select: { name: true } },
        },
        orderBy: [{ center: { name: 'asc' } }, { name: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.academicAssignmentReport.findMany({
        where: {
          teachingSession: {
            courseClassrooms: {
              some: effectiveBuildingIds
                ? { classroom: { buildingId: { in: effectiveBuildingIds } } }
                : {},
            },
          },
        },
        select: {
          teacher: {
            select: {
              id: true,
              user: { select: { name: true, code: true } },
            },
          },
        },
        distinct: ['teacherId'],
        orderBy: { teacherId: 'asc' },
      }),
    ]);

    return {
      filters: {
        centerDepartmentId: 'hidden' as const,
        buildingId:
          !isGlobal && authorizedBuildingIds.length === 1
            ? ('locked' as const)
            : ('selectable' as const),
        teacherId: 'selectable' as const,
      },
      defaults: {
        centerDepartmentId: null,
        buildingId:
          requestedBuildingId ??
          (!isGlobal && authorizedBuildingIds.length === 1
            ? authorizedBuildingIds[0]
            : null),
        teacherId: null,
      },
      options: {
        centerDepartments: [],
        buildings: buildings.map((building) => ({
          id: building.id,
          label: `${building.center.name} - ${building.name}`,
          name: building.name,
          centerId: building.centerId,
          centerName: building.center.name,
        })),
        teachers: this.teacherOptions(reports),
      },
    };
  }

  private async buildDomainContext(
    scope: AnalyticsDomainScope,
    requestedCenterDepartmentId: string | undefined,
    strictRequestedCenter: boolean,
    supportsTeacherFilter = true,
  ): Promise<DomainFilterContext> {
    const applicableCenterId = this.applicableCenterId(
      scope,
      requestedCenterDepartmentId,
      strictRequestedCenter,
    );
    const effectiveScope = this.scopeService.intersectRequestedScope(
      scope,
      applicableCenterId ? { centerDepartmentIds: [applicableCenterId] } : {},
    );
    const authorizedCenterIds = [
      ...new Set(
        scope.branches.flatMap((branch) =>
          branch.type === 'centerDepartments' ? branch.centerDepartmentIds : [],
        ),
      ),
    ];
    const isPureTeacher = scope.branches.every(
      (branch) => branch.type === 'teacher',
    );
    const isGlobal = scope.branches.some((branch) => branch.type === 'global');
    const ownTeacherIds = [
      ...new Set(
        effectiveScope.branches.flatMap((branch) =>
          branch.type === 'teacher' ? [branch.teacherId] : [],
        ),
      ),
    ];

    const [centerDepartments, reports] = await Promise.all([
      !isPureTeacher
        ? this.prisma.centerDepartment.findMany({
            where: isGlobal ? {} : { id: { in: authorizedCenterIds } },
            select: {
              id: true,
              center: { select: { name: true } },
              department: { select: { name: true } },
            },
            orderBy: [
              { center: { name: 'asc' } },
              { department: { name: 'asc' } },
              { id: 'asc' },
            ],
          })
        : Promise.resolve([] as CenterDepartmentOptionSource[]),
      supportsTeacherFilter
        ? this.prisma.academicAssignmentReport.findMany({
            where: this.reportsWhere(effectiveScope),
            select: {
              teacher: {
                select: {
                  id: true,
                  user: { select: { name: true, code: true } },
                },
              },
            },
            distinct: ['teacherId'],
            orderBy: { teacherId: 'asc' },
          })
        : Promise.resolve([] as TeacherOptionSource[]),
    ]);

    return {
      filters: {
        centerDepartmentId: isPureTeacher
          ? 'hidden'
          : !isGlobal && authorizedCenterIds.length === 1
            ? 'locked'
            : 'selectable',
        teacherId: supportsTeacherFilter
          ? isPureTeacher
            ? 'locked'
            : 'selectable'
          : 'hidden',
      },
      defaults: {
        centerDepartmentId:
          applicableCenterId ??
          (!isGlobal && authorizedCenterIds.length === 1
            ? authorizedCenterIds[0]
            : null),
        teacherId:
          supportsTeacherFilter && isPureTeacher
            ? (ownTeacherIds[0] ?? null)
            : null,
      },
      options: {
        centerDepartments: centerDepartments.map((centerDepartment) => ({
          id: centerDepartment.id,
          label: `${centerDepartment.center.name} - ${centerDepartment.department.name}`,
          centerName: centerDepartment.center.name,
          departmentName: centerDepartment.department.name,
        })),
        teachers: this.teacherOptions(reports),
      },
    };
  }

  private async buildStaffContext(
    scope: AnalyticsDomainScope,
    requestedCenterDepartmentId: string | undefined,
  ): Promise<DomainFilterContext> {
    const base = await this.buildDomainContext(
      scope,
      requestedCenterDepartmentId,
      false,
      false,
    );
    const applicableCenterId = this.applicableCenterId(
      scope,
      requestedCenterDepartmentId,
      false,
    );
    const effectiveScope = this.scopeService.intersectRequestedScope(
      scope,
      applicableCenterId ? { centerDepartmentIds: [applicableCenterId] } : {},
    );
    const now = new Date();
    const global = effectiveScope.branches.find(
      (branch) => branch.type === 'global',
    );
    const teachers = await this.prisma.teacher.findMany({
      where: {
        user: { activeStatus: true },
        ...(global?.type === 'global'
          ? global.centerDepartmentIds
            ? {
                positionHeld: {
                  some: {
                    centerDepartmentId: { in: global.centerDepartmentIds },
                    startDate: { lte: now },
                    OR: [{ endDate: null }, { endDate: { gte: now } }],
                  },
                },
              }
            : {}
          : {
              OR: effectiveScope.branches.map((branch) =>
                branch.type === 'teacher'
                  ? { id: branch.teacherId }
                  : {
                      positionHeld: {
                        some: {
                          centerDepartmentId: {
                            in: branch.centerDepartmentIds,
                          },
                          startDate: { lte: now },
                          OR: [{ endDate: null }, { endDate: { gte: now } }],
                        },
                      },
                    },
              ),
            }),
      },
      select: {
        id: true,
        user: { select: { name: true, code: true } },
      },
      orderBy: { id: 'asc' },
    });
    const isPureTeacher = scope.branches.every(
      (branch) => branch.type === 'teacher',
    );
    return {
      ...base,
      filters: {
        ...base.filters,
        teacherId: isPureTeacher ? 'locked' : 'selectable',
      },
      defaults: {
        ...base.defaults,
        teacherId: isPureTeacher ? (teachers[0]?.id ?? null) : null,
      },
      options: {
        ...base.options,
        teachers: teachers
          .map((teacher: ActiveTeacherOptionSource) => ({
            id: teacher.id,
            label: `${teacher.user.code} - ${teacher.user.name}`,
            name: teacher.user.name,
            code: teacher.user.code,
          }))
          .sort(
            (left, right) =>
              left.name.localeCompare(right.name, 'es') ||
              left.code.localeCompare(right.code, 'es') ||
              left.id.localeCompare(right.id),
          ),
      },
    };
  }

  private applicableCenterId(
    scope: AnalyticsDomainScope,
    requestedCenterDepartmentId: string | undefined,
    strict: boolean,
  ) {
    if (!requestedCenterDepartmentId) return undefined;
    if (strict) return requestedCenterDepartmentId;
    const acceptsRequestedCenter = scope.branches.some(
      (branch) =>
        branch.type === 'global' ||
        (branch.type === 'centerDepartments' &&
          branch.centerDepartmentIds.includes(requestedCenterDepartmentId)),
    );
    return acceptsRequestedCenter ? requestedCenterDepartmentId : undefined;
  }

  private reportsWhere(scope: AnalyticsEffectiveScope) {
    const globalBranch = scope.branches.find(
      (branch) => branch.type === 'global',
    );
    if (globalBranch) {
      return {
        ...(globalBranch.teacherId
          ? { teacherId: globalBranch.teacherId }
          : {}),
        ...(globalBranch.centerDepartmentIds
          ? {
              centerDepartmentId: {
                in: globalBranch.centerDepartmentIds,
              },
            }
          : {}),
      };
    }
    return {
      OR: scope.branches.map((branch) => {
        if (branch.type === 'teacher') return { teacherId: branch.teacherId };
        return {
          ...(branch.teacherId ? { teacherId: branch.teacherId } : {}),
          centerDepartmentId: { in: branch.centerDepartmentIds },
        };
      }),
    };
  }

  private teacherOptions(reports: TeacherOptionSource[]) {
    return reports
      .map(({ teacher }) => ({
        id: teacher.id,
        label: `${teacher.user.code} - ${teacher.user.name}`,
        name: teacher.user.name,
        code: teacher.user.code,
      }))
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name, 'es') ||
          left.code.localeCompare(right.code, 'es') ||
          left.id.localeCompare(right.id),
      );
  }
}
