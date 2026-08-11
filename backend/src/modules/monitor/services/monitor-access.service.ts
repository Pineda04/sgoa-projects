import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type TMonitorReadScope =
  | { type: 'global' }
  | { type: 'buildings'; buildingIds: string[] };

@Injectable()
export class MonitorAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveReadScope(userId: string): Promise<TMonitorReadScope> {
    const user = await this.loadActiveUser(userId);

    if (
      user.isSuperAdmin ||
      user.permissions.includes('manage:reports-monitor')
    ) {
      return { type: 'global' };
    }

    if (!user.permissions.includes('read:reports-monitor')) {
      throw new ForbiddenException('No tiene acceso a datos de monitoreo.');
    }

    return {
      type: 'buildings',
      buildingIds: user.buildingIds,
    };
  }

  async getAssignedBuildingIdsForCapture(userId: string): Promise<string[]> {
    const user = await this.loadActiveUser(userId);
    const canCapture =
      user.isSuperAdmin ||
      user.permissions.includes('manage:schedule-compliance-check') ||
      user.permissions.includes('create:schedule-compliance-check');

    if (!canCapture) {
      throw new ForbiddenException(
        'No tiene permiso para registrar verificaciones.',
      );
    }

    return user.buildingIds;
  }

  private async loadActiveUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, activeStatus: true },
      select: {
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
        monitorBuildingAssignments: { select: { buildingId: true } },
      },
    });

    if (!user) {
      throw new ForbiddenException('El usuario no está activo.');
    }

    return {
      isSuperAdmin: user.userRoles.some(({ role }) => role.isSuperAdmin),
      permissions: [
        ...new Set(
          user.userRoles.flatMap(({ role }) =>
            role.rolePermissions.map(
              ({ permission }) => `${permission.action}:${permission.subject}`,
            ),
          ),
        ),
      ],
      buildingIds: user.monitorBuildingAssignments.map(
        ({ buildingId }) => buildingId,
      ),
    };
  }
}
