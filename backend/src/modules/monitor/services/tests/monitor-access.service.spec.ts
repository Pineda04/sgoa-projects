import { ForbiddenException } from '@nestjs/common';
import { EUserRole } from 'src/common/enums';
import { MonitorAccessService } from '../monitor-access.service';

describe('MonitorAccessService', () => {
  const prisma = { user: { findFirst: jest.fn() } };
  const service = new MonitorAccessService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns only assigned buildings for a monitor', async () => {
    prisma.user.findFirst.mockResolvedValue({
      userRoles: [{ role: { name: EUserRole.MONITOR } }],
      monitorBuildingAssignments: [
        { buildingId: 'building-1' },
        { buildingId: 'building-2' },
      ],
    });

    await expect(service.resolveReadScope('monitor-1')).resolves.toEqual({
      type: 'buildings',
      buildingIds: ['building-1', 'building-2'],
    });
  });

  it.each([EUserRole.ADMIN, EUserRole.DIRECCION])(
    'returns global read scope for %s',
    async (role) => {
      prisma.user.findFirst.mockResolvedValue({
        userRoles: [{ role: { name: role } }],
        monitorBuildingAssignments: [],
      });

      await expect(service.resolveReadScope('user-1')).resolves.toEqual({
        type: 'global',
      });
    },
  );

  it('rejects inactive users even when a stale token still has MONITOR', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.resolveReadScope('monitor-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
