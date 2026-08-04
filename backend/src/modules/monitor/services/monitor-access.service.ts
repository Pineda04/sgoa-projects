import { ForbiddenException, Injectable } from '@nestjs/common';
import { EUserRole } from 'src/common/enums';
import { PrismaService } from 'src/prisma/prisma.service';

export type TMonitorReadScope =
  | { type: 'global' }
  | { type: 'buildings'; buildingIds: string[] };

@Injectable()
export class MonitorAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveReadScope(userId: string): Promise<TMonitorReadScope> {
    const user = await this.loadActiveUser(userId);
    const roles = user.userRoles.map(({ role }) => role.name);

    if (
      roles.includes(EUserRole.ADMIN) ||
      roles.includes(EUserRole.DIRECCION)
    ) {
      return { type: 'global' };
    }

    if (!roles.includes(EUserRole.MONITOR)) {
      throw new ForbiddenException('No tiene acceso a datos de monitoreo.');
    }

    return {
      type: 'buildings',
      buildingIds: user.monitorBuildingAssignments.map(
        ({ buildingId }) => buildingId,
      ),
    };
  }

  async getAssignedBuildingIdsForCapture(userId: string): Promise<string[]> {
    const user = await this.loadActiveUser(userId);
    const isMonitor = user.userRoles.some(
      ({ role }) => role.name === 'MONITOR',
    );

    if (!isMonitor) {
      throw new ForbiddenException(
        'Solo un monitor activo puede registrar verificaciones.',
      );
    }

    return user.monitorBuildingAssignments.map(({ buildingId }) => buildingId);
  }

  private async loadActiveUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, activeStatus: true },
      select: {
        userRoles: { select: { role: { select: { name: true } } } },
        monitorBuildingAssignments: { select: { buildingId: true } },
      },
    });

    if (!user) {
      throw new ForbiddenException('El usuario no está activo.');
    }

    return user;
  }
}
