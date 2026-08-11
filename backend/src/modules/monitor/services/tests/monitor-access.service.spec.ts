import { ForbiddenException } from '@nestjs/common';
import { MonitorAccessService } from '../monitor-access.service';

type TPermission = {
  action: string;
  subject: string;
};

const buildUser = ({
  roleName = 'CUSTOM_ROLE',
  isSuperAdmin = false,
  permissions = [],
  buildingIds = [],
}: {
  roleName?: string;
  isSuperAdmin?: boolean;
  permissions?: TPermission[];
  buildingIds?: string[];
} = {}) => ({
  userRoles: [
    {
      role: {
        name: roleName,
        isSuperAdmin,
        rolePermissions: permissions.map((permission) => ({ permission })),
      },
    },
  ],
  monitorBuildingAssignments: buildingIds.map((buildingId) => ({ buildingId })),
});

describe('MonitorAccessService', () => {
  const prisma = { user: { findFirst: jest.fn() } };
  const service = new MonitorAccessService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns global read scope with manage:reports-monitor', async () => {
    prisma.user.findFirst.mockResolvedValue(
      buildUser({
        roleName: 'ANY_REPORT_MANAGER',
        permissions: [{ action: 'manage', subject: 'reports-monitor' }],
      }),
    );

    await expect(service.resolveReadScope('user-1')).resolves.toEqual({
      type: 'global',
    });
  });

  it('returns assigned buildings with read:reports-monitor', async () => {
    prisma.user.findFirst.mockResolvedValue(
      buildUser({
        roleName: 'ANY_REPORT_READER',
        permissions: [{ action: 'read', subject: 'reports-monitor' }],
        buildingIds: ['building-1', 'building-2'],
      }),
    );

    await expect(service.resolveReadScope('user-1')).resolves.toEqual({
      type: 'buildings',
      buildingIds: ['building-1', 'building-2'],
    });
  });

  it.each(['MONITOR', 'DIRECCION', 'SUPER_ADMIN'])(
    'does not grant read access based on the %s role name',
    async (roleName) => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ roleName }));

      await expect(service.resolveReadScope('user-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    },
  );

  it.each(['create', 'manage'])(
    '%s:schedule-compliance-check allows capture',
    async (action) => {
      prisma.user.findFirst.mockResolvedValue(
        buildUser({
          roleName: 'ANY_CAPTURE_ROLE',
          permissions: [{ action, subject: 'schedule-compliance-check' }],
          buildingIds: ['building-1'],
        }),
      );

      await expect(
        service.getAssignedBuildingIdsForCapture('user-1'),
      ).resolves.toEqual(['building-1']);
    },
  );

  it('does not grant capture access based on an arbitrary role name', async () => {
    prisma.user.findFirst.mockResolvedValue(
      buildUser({ roleName: 'MONITOR', buildingIds: ['building-1'] }),
    );

    await expect(
      service.getAssignedBuildingIdsForCapture('user-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('gives a superadmin global read and capture access without permissions', async () => {
    prisma.user.findFirst.mockResolvedValue(
      buildUser({
        roleName: 'ANY_SUPERADMIN_ROLE',
        isSuperAdmin: true,
        buildingIds: ['building-1'],
      }),
    );

    await expect(service.resolveReadScope('admin-1')).resolves.toEqual({
      type: 'global',
    });
    await expect(
      service.getAssignedBuildingIdsForCapture('admin-1'),
    ).resolves.toEqual(['building-1']);
  });

  it.each([
    ['read scope', () => service.resolveReadScope('inactive-user')],
    [
      'capture scope',
      () => service.getAssignedBuildingIdsForCapture('inactive-user'),
    ],
  ])('rejects an inactive user when resolving %s', async (_label, resolve) => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(resolve()).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('loads only active users and current authorization data', async () => {
    prisma.user.findFirst.mockResolvedValue(
      buildUser({
        permissions: [{ action: 'read', subject: 'reports-monitor' }],
      }),
    );

    await service.resolveReadScope('user-1');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', activeStatus: true },
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
  });
});
