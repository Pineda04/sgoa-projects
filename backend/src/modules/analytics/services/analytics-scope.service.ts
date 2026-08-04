import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EUserRole } from 'src/common/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { EPosition } from 'src/modules/teachers-config/enums';
import {
  ANALYTICS_DOMAINS,
  AnalyticsContext,
  AnalyticsDomain,
  AnalyticsDomainScope,
  AnalyticsEffectiveBranch,
  AnalyticsEffectiveScope,
  AnalyticsRequestedScope,
  AnalyticsScopeBranch,
} from '../types';

const ALL_DOMAINS: AnalyticsDomain[] = [
  'academic-load',
  'enrollment',
  'classrooms',
  'staff',
  'technology',
  'activities',
  'monitoring',
];

const ROLE_DOMAINS: Partial<Record<EUserRole, AnalyticsDomain[]>> = {
  [EUserRole.DIRECCION]: ALL_DOMAINS,
  [EUserRole.RRHH]: ['academic-load', 'staff'],
  [EUserRole.DOCENTE]: [
    'academic-load',
    'enrollment',
    'classrooms',
    'activities',
  ],
  [EUserRole.COORDINADOR_AREA]: [
    'academic-load',
    'enrollment',
    'classrooms',
    'staff',
    'technology',
    'activities',
  ],
  [EUserRole.MONITOR]: ['monitoring'],
};

@Injectable()
export class AnalyticsScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async getDomainScope(
    userId: string,
    domain: AnalyticsDomain,
  ): Promise<AnalyticsDomainScope> {
    const context = await this.loadContext(userId);

    return this.resolveDomainScope(context, domain);
  }

  async getDomainScopes(
    userId: string,
    domains: readonly AnalyticsDomain[] = ANALYTICS_DOMAINS,
  ): Promise<AnalyticsDomainScope[]> {
    const context = await this.loadContext(userId);

    return domains.map((domain) => this.resolveDomainScope(context, domain));
  }

  private resolveDomainScope(
    context: AnalyticsContext,
    domain: AnalyticsDomain,
  ): AnalyticsDomainScope {
    if (context.roles.includes(EUserRole.ADMIN)) {
      return { domain, branches: [{ type: 'global' }] };
    }

    if (
      context.roles.some(
        (role) =>
          role === EUserRole.DIRECCION && ROLE_DOMAINS[role]?.includes(domain),
      )
    ) {
      return { domain, branches: [{ type: 'global' }] };
    }

    const branches: AnalyticsScopeBranch[] = [];

    if (
      context.roles.includes(EUserRole.RRHH) &&
      ROLE_DOMAINS[EUserRole.RRHH]?.includes(domain)
    ) {
      return { domain, branches: [{ type: 'global' }] };
    }

    if (
      context.roles.includes(EUserRole.DOCENTE) &&
      ROLE_DOMAINS[EUserRole.DOCENTE]?.includes(domain) &&
      context.teacherId
    ) {
      branches.push({ type: 'teacher', teacherId: context.teacherId });
    }

    if (
      context.roles.includes(EUserRole.MONITOR) &&
      ROLE_DOMAINS[EUserRole.MONITOR]?.includes(domain) &&
      context.monitorBuildingIds.length
    ) {
      branches.push({
        type: 'buildings',
        buildingIds: context.monitorBuildingIds,
        centerDepartmentIds: [],
      });
    }

    if (
      context.roles.includes(EUserRole.COORDINADOR_AREA) &&
      ROLE_DOMAINS[EUserRole.COORDINADOR_AREA]?.includes(domain) &&
      context.centerDepartmentIds.length
    ) {
      branches.push({
        type: 'centerDepartments',
        centerDepartmentIds: context.centerDepartmentIds,
      });
    }

    return { domain, branches };
  }

  intersectRequestedScope(
    scope: AnalyticsDomainScope,
    requested: AnalyticsRequestedScope = {},
  ): AnalyticsEffectiveScope {
    const branches: AnalyticsEffectiveBranch[] = [];

    for (const branch of scope.branches) {
      if (branch.type === 'global') {
        branches.push({ type: 'global', ...requested });
        continue;
      }

      if (branch.type === 'teacher') {
        const requestsAnotherTeacher =
          requested.teacherId !== undefined &&
          requested.teacherId !== branch.teacherId;
        const requestsCenterDepartments =
          requested.centerDepartmentIds !== undefined;

        if (!requestsAnotherTeacher && !requestsCenterDepartments) {
          branches.push(branch);
        }

        continue;
      }

      if (branch.type === 'buildings') {
        const allowedIds = new Set(branch.buildingIds);
        const requestsForbiddenBuilding = requested.buildingIds?.some(
          (id) => !allowedIds.has(id),
        );

        if (!requestsForbiddenBuilding) {
          branches.push({
            type: 'buildings',
            buildingIds: requested.buildingIds ?? branch.buildingIds,
            centerDepartmentIds: [],
          });
        }

        continue;
      }

      const allowedIds = new Set(branch.centerDepartmentIds);
      const requestsForbiddenCenter = requested.centerDepartmentIds?.some(
        (id) => !allowedIds.has(id),
      );

      if (!requestsForbiddenCenter) {
        branches.push({
          type: 'centerDepartments',
          centerDepartmentIds:
            requested.centerDepartmentIds ?? branch.centerDepartmentIds,
          ...(requested.teacherId !== undefined
            ? { teacherId: requested.teacherId }
            : {}),
        });
      }
    }

    const hasExplicitTeacher = requested.teacherId !== undefined;
    const hasExplicitCenters = requested.centerDepartmentIds !== undefined;
    const hasExplicitBuildings = requested.buildingIds !== undefined;

    if (
      !branches.length &&
      (hasExplicitTeacher || hasExplicitCenters || hasExplicitBuildings)
    ) {
      if (hasExplicitBuildings) {
        throw new ForbiddenException(
          'Uno o más edificios solicitados están fuera del alcance de Analytics.',
        );
      }
      if (hasExplicitCenters) {
        throw new ForbiddenException(
          'Uno o más departamentos solicitados están fuera del alcance de Analytics.',
        );
      }

      throw new ForbiddenException(
        'El docente solicitado está fuera del alcance de Analytics.',
      );
    }

    return { domain: scope.domain, branches };
  }

  private async loadContext(userId: string): Promise<AnalyticsContext> {
    const now = new Date();
    const user = await this.prisma.user.findFirst({
      where: { id: userId, activeStatus: true },
      select: {
        id: true,
        userRoles: { select: { role: { select: { name: true } } } },
        teacher: {
          select: {
            id: true,
            positionHeld: {
              where: {
                startDate: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
                position: { name: EPosition.DEPARTMENT_HEAD },
              },
              select: { centerDepartmentId: true },
            },
          },
        },
        monitorBuildingAssignments: { select: { buildingId: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('El usuario no está activo.');
    }

    const knownRoles = new Set(Object.values(EUserRole));
    const roles = user.userRoles
      .map(({ role }) => role.name)
      .filter((role): role is EUserRole => knownRoles.has(role as EUserRole));

    return {
      userId: user.id,
      roles: [...new Set(roles)],
      teacherId: user.teacher?.id ?? null,
      centerDepartmentIds: [
        ...new Set(
          user.teacher?.positionHeld.map(
            ({ centerDepartmentId }) => centerDepartmentId,
          ) ?? [],
        ),
      ],
      monitorBuildingIds: [
        ...new Set(
          (user.monitorBuildingAssignments ?? []).map(
            ({ buildingId }) => buildingId,
          ),
        ),
      ],
    };
  }
}
