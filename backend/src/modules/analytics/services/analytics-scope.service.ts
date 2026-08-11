import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TPermissionSubject } from 'src/common/constants';
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

const DOMAIN_PERMISSION_SUBJECTS: Record<AnalyticsDomain, TPermissionSubject> =
  {
    'academic-load': 'analytics-academic-load',
    enrollment: 'analytics-enrollment',
    classrooms: 'analytics-classrooms',
    staff: 'analytics-staff',
    technology: 'analytics-technology',
    activities: 'analytics-activities',
    monitoring: 'analytics-monitoring',
  };

const TEACHER_SCOPED_DOMAINS = new Set<AnalyticsDomain>([
  'academic-load',
  'enrollment',
  'classrooms',
  'activities',
]);

const CENTER_DEPARTMENT_SCOPED_DOMAINS = new Set<AnalyticsDomain>([
  'academic-load',
  'enrollment',
  'classrooms',
  'staff',
  'technology',
  'activities',
]);

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
    if (context.isSuperAdmin) {
      return { domain, branches: [{ type: 'global' }] };
    }

    const permissionSubject = DOMAIN_PERMISSION_SUBJECTS[domain];

    if (context.permissions.includes(`manage:${permissionSubject}`)) {
      return { domain, branches: [{ type: 'global' }] };
    }

    const branches: AnalyticsScopeBranch[] = [];

    if (!context.permissions.includes(`read:${permissionSubject}`)) {
      return { domain, branches };
    }

    if (TEACHER_SCOPED_DOMAINS.has(domain) && context.teacherId) {
      branches.push({ type: 'teacher', teacherId: context.teacherId });
    }

    if (domain === 'monitoring' && context.monitorBuildingIds.length) {
      branches.push({
        type: 'buildings',
        buildingIds: context.monitorBuildingIds,
        centerDepartmentIds: [],
      });
    }

    if (
      CENTER_DEPARTMENT_SCOPED_DOMAINS.has(domain) &&
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
        userRoles: {
          select: {
            role: {
              select: {
                isSuperAdmin: true,
                rolePermissions: {
                  select: {
                    permission: { select: { action: true, subject: true } },
                  },
                },
              },
            },
          },
        },
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

    return {
      userId: user.id,
      permissions: [
        ...new Set(
          user.userRoles.flatMap(({ role }) =>
            role.rolePermissions.map(
              ({ permission }) => `${permission.action}:${permission.subject}`,
            ),
          ),
        ),
      ],
      isSuperAdmin: user.userRoles.some(({ role }) => role.isSuperAdmin),
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
