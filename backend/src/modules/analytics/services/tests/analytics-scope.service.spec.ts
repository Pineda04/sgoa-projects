import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { EPosition } from 'src/modules/teachers-config/enums';
import { AnalyticsScopeService } from '../analytics-scope.service';
import { AnalyticsDomainScope } from '../../types';

const USER_ID = 'user-id';
const TEACHER_ID = 'teacher-id';
const CENTER_DEPARTMENT_IDS = ['center-department-1', 'center-department-2'];
const DOMAIN_SUBJECTS = {
  'academic-load': 'analytics-academic-load',
  enrollment: 'analytics-enrollment',
  classrooms: 'analytics-classrooms',
  staff: 'analytics-staff',
  technology: 'analytics-technology',
  activities: 'analytics-activities',
  monitoring: 'analytics-monitoring',
} as const;

type AnalyticsDomain = keyof typeof DOMAIN_SUBJECTS;
type PermissionAction = 'read' | 'manage';
type MockRole = {
  name: string;
  isSuperAdmin?: boolean;
  permissions?: { action: PermissionAction; subject: string }[];
};

const permission = (action: PermissionAction, domain: AnalyticsDomain) => ({
  action,
  subject: DOMAIN_SUBJECTS[domain],
});

const role = (
  name: string,
  permissions: MockRole['permissions'] = [],
  isSuperAdmin = false,
): MockRole => ({ name, permissions, isSuperAdmin });

type ScopeUserQuery = {
  select: {
    teacher: {
      select: {
        positionHeld: {
          where: {
            startDate?: { lte?: Date };
            OR?: ({ endDate: null } | { endDate: { gte: Date } })[];
          };
        };
      };
    };
  };
};

describe('AnalyticsScopeService', () => {
  let service: AnalyticsScopeService;
  let lastScopeUserQuery: ScopeUserQuery | undefined;
  const prisma = {
    user: {
      findFirst: jest.fn(),
    },
  };

  const mockUser = (
    roles: MockRole[],
    options: {
      teacherId?: string | null;
      centerDepartmentIds?: string[];
      active?: boolean;
      futureAppointmentOnly?: boolean;
      expiredAppointmentOnly?: boolean;
      monitorBuildingIds?: string[];
    } = {},
  ) => {
    prisma.user.findFirst.mockImplementation((query: ScopeUserQuery) => {
      lastScopeUserQuery = query;
      if (options.active === false) return Promise.resolve(null);

      const filtersAppointmentsByStartDate =
        query.select.teacher.select.positionHeld.where.startDate?.lte instanceof
        Date;
      const filtersAppointmentsByEndDate =
        query.select.teacher.select.positionHeld.where.OR?.some(
          (condition) =>
            condition.endDate !== null && condition.endDate.gte instanceof Date,
        ) ?? false;
      const centerDepartmentIds =
        (options.futureAppointmentOnly && filtersAppointmentsByStartDate) ||
        (options.expiredAppointmentOnly && filtersAppointmentsByEndDate)
          ? []
          : (options.centerDepartmentIds ?? CENTER_DEPARTMENT_IDS);

      return Promise.resolve({
        id: USER_ID,
        userRoles: roles.map((mockRole) => ({
          role: {
            name: mockRole.name,
            isSuperAdmin: mockRole.isSuperAdmin ?? false,
            rolePermissions: (mockRole.permissions ?? []).map((permission) => ({
              permission,
            })),
          },
        })),
        monitorBuildingAssignments: (options.monitorBuildingIds ?? []).map(
          (buildingId) => ({ buildingId }),
        ),
        teacher:
          options.teacherId === null
            ? null
            : {
                id: options.teacherId ?? TEACHER_ID,
                positionHeld: centerDepartmentIds.map((centerDepartmentId) => ({
                  centerDepartmentId,
                })),
              },
      });
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    lastScopeUserQuery = undefined;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsScopeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnalyticsScopeService);
  });

  describe('getDomainScope', () => {
    it('reloads the active user, current permissions and current department-head appointments', async () => {
      mockUser([role('any-name', [permission('read', 'staff')])]);

      await service.getDomainScope(USER_ID, 'staff');

      const query = lastScopeUserQuery as ScopeUserQuery;
      const appointmentStart = query.select.teacher.select.positionHeld.where
        .startDate?.lte as Date;

      expect(appointmentStart).toBeInstanceOf(Date);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: USER_ID, activeStatus: true },
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
                  startDate: { lte: appointmentStart },
                  OR: [
                    { endDate: null },
                    { endDate: { gte: appointmentStart } },
                  ],
                  position: { name: EPosition.DEPARTMENT_HEAD },
                },
                select: { centerDepartmentId: true },
              },
            },
          },
          monitorBuildingAssignments: { select: { buildingId: true } },
        },
      });
    });

    it('rejects a missing or inactive user', async () => {
      mockUser([], { active: false });

      await expect(
        service.getDomainScope(USER_ID, 'academic-load'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it.each([
      'academic-load',
      'enrollment',
      'classrooms',
      'staff',
      'technology',
      'activities',
      'monitoring',
    ] as const)('grants a super admin global scope for %s', async (domain) => {
      mockUser([role('arbitrary-super-admin-name', [], true)]);

      await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
        domain,
        branches: [{ type: 'global' }],
      });
    });

    it('uses the persisted isSuperAdmin flag independently of role name', async () => {
      mockUser([role('RENAMED_SUPER_ADMIN', [], true)]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({
        domain: 'monitoring',
        branches: [{ type: 'global' }],
      });
    });

    it('does not infer super-admin scope from a role name', async () => {
      mockUser([role('SUPER_ADMIN')]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({ domain: 'monitoring', branches: [] });
    });

    it('makes isSuperAdmin prevail over permissions and relation branches', async () => {
      mockUser([
        role('reader', [permission('read', 'academic-load')]),
        role('super', [], true),
      ]);

      await expect(
        service.getDomainScope(USER_ID, 'academic-load'),
      ).resolves.toEqual({
        domain: 'academic-load',
        branches: [{ type: 'global' }],
      });
    });

    it.each([
      'academic-load',
      'enrollment',
      'classrooms',
      'staff',
      'technology',
      'activities',
      'monitoring',
    ] as const)('grants manage:%s global scope', async (domain) => {
      mockUser([role('domain-manager', [permission('manage', domain)])]);

      await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
        domain,
        branches: [{ type: 'global' }],
      });
    });

    it('does not grant one domain from another domain permission', async () => {
      mockUser([role('manager', [permission('manage', 'staff')])]);

      await expect(
        service.getDomainScope(USER_ID, 'technology'),
      ).resolves.toEqual({
        domain: 'technology',
        branches: [],
      });
    });

    it.each([
      ['academic-load', ['teacher', 'centerDepartments']],
      ['enrollment', ['teacher', 'centerDepartments']],
      ['classrooms', ['teacher', 'centerDepartments']],
      ['staff', ['centerDepartments']],
      ['technology', ['centerDepartments']],
      ['activities', ['teacher', 'centerDepartments']],
      ['monitoring', ['buildings']],
    ] as const)(
      'grants read:%s only through actual applicable relations',
      async (domain, branchTypes) => {
        mockUser([role('reader', [permission('read', domain)])], {
          monitorBuildingIds: ['building-1', 'building-2'],
        });

        const scope = await service.getDomainScope(USER_ID, domain);

        expect(scope.domain).toBe(domain);
        expect(scope.branches.map(({ type }) => type)).toEqual(branchTypes);
        if ((branchTypes as readonly string[]).includes('teacher')) {
          expect(scope.branches).toContainEqual({
            type: 'teacher',
            teacherId: TEACHER_ID,
          });
        }
        if ((branchTypes as readonly string[]).includes('centerDepartments')) {
          expect(scope.branches).toContainEqual({
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
          });
        }
        if ((branchTypes as readonly string[]).includes('buildings')) {
          expect(scope.branches).toContainEqual({
            type: 'buildings',
            buildingIds: ['building-1', 'building-2'],
            centerDepartmentIds: [],
          });
        }
      },
    );

    it('makes manage prevail over read and normalizes to global', async () => {
      mockUser([
        role('reader', [permission('read', 'academic-load')]),
        role('manager', [permission('manage', 'academic-load')]),
      ]);

      await expect(
        service.getDomainScope(USER_ID, 'academic-load'),
      ).resolves.toEqual({
        domain: 'academic-load',
        branches: [{ type: 'global' }],
      });
    });

    it('uses permission grants regardless of role names', async () => {
      for (const name of ['DIRECCION', 'completely-renamed-role']) {
        mockUser([role(name, [permission('manage', 'technology')])]);

        await expect(
          service.getDomainScope(USER_ID, 'technology'),
        ).resolves.toEqual({
          domain: 'technology',
          branches: [{ type: 'global' }],
        });
      }
    });

    it('does not grant a center branch without a current appointment', async () => {
      mockUser([role('reader', [permission('read', 'staff')])], {
        centerDepartmentIds: [],
      });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('excludes a department-head appointment that starts in the future', async () => {
      mockUser([role('reader', [permission('read', 'staff')])], {
        futureAppointmentOnly: true,
      });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('excludes an appointment whose end date has passed', async () => {
      mockUser([role('reader', [permission('read', 'staff')])], {
        expiredAppointmentOnly: true,
      });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('combines teacher and department-head relations behind one read grant', async () => {
      mockUser([role('reader', [permission('read', 'classrooms')])]);

      await expect(
        service.getDomainScope(USER_ID, 'classrooms'),
      ).resolves.toEqual({
        domain: 'classrooms',
        branches: [
          { type: 'teacher', teacherId: TEACHER_ID },
          {
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
          },
        ],
      });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('gives a monitoring reader no scope until building assignments exist', async () => {
      mockUser([role('reader', [permission('read', 'monitoring')])]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({ domain: 'monitoring', branches: [] });
    });

    it('limits monitoring read scope to assigned buildings', async () => {
      mockUser([role('reader', [permission('read', 'monitoring')])], {
        monitorBuildingIds: ['building-1', 'building-2'],
      });

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({
        domain: 'monitoring',
        branches: [
          {
            type: 'buildings',
            buildingIds: ['building-1', 'building-2'],
            centerDepartmentIds: [],
          },
        ],
      });
    });

    it('gives no scope without an applicable permission', async () => {
      mockUser([]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({ domain: 'monitoring', branches: [] });
    });

    it('combines permissions from multiple persisted roles', async () => {
      mockUser([
        role('first', [permission('read', 'staff')]),
        role('second', [permission('manage', 'monitoring')]),
      ]);

      await expect(
        service.getDomainScopes(USER_ID, ['staff', 'monitoring']),
      ).resolves.toEqual([
        {
          domain: 'staff',
          branches: [
            {
              type: 'centerDepartments',
              centerDepartmentIds: CENTER_DEPARTMENT_IDS,
            },
          ],
        },
        { domain: 'monitoring', branches: [{ type: 'global' }] },
      ]);
    });
  });

  describe('intersectRequestedScope', () => {
    const combinedScope: AnalyticsDomainScope = {
      domain: 'academic-load',
      branches: [
        { type: 'teacher', teacherId: TEACHER_ID },
        {
          type: 'centerDepartments',
          centerDepartmentIds: CENTER_DEPARTMENT_IDS,
        },
      ],
    };
    const coordinatorScope: AnalyticsDomainScope = {
      domain: 'academic-load',
      branches: [
        {
          type: 'centerDepartments',
          centerDepartmentIds: CENTER_DEPARTMENT_IDS,
        },
      ],
    };
    const buildingScope: AnalyticsDomainScope = {
      domain: 'monitoring',
      branches: [
        {
          type: 'buildings',
          buildingIds: ['building-1', 'building-2'],
          centerDepartmentIds: [],
        },
      ],
    };

    it('keeps an unrestricted global scope', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'staff',
        branches: [{ type: 'global' }],
      };

      expect(service.intersectRequestedScope(scope)).toEqual(scope);
    });

    it('keeps global teacher and center filters conjunctive in one branch', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'staff',
        branches: [{ type: 'global' }],
      };

      expect(
        service.intersectRequestedScope(scope, {
          teacherId: 'requested-teacher',
          centerDepartmentIds: ['requested-department'],
        }),
      ).toEqual({
        domain: 'staff',
        branches: [
          {
            type: 'global',
            teacherId: 'requested-teacher',
            centerDepartmentIds: ['requested-department'],
          },
        ],
      });
    });

    it('forces the own teacher when no teacher was explicitly requested', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'activities',
        branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
      };

      expect(service.intersectRequestedScope(scope)).toEqual(scope);
    });

    it('accepts only the own explicit teacher for a pure teacher scope', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'academic-load',
        branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
      };

      expect(
        service.intersectRequestedScope(scope, {
          teacherId: TEACHER_ID,
        }),
      ).toEqual({
        domain: 'academic-load',
        branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
      });
    });

    it('rejects another teacher for a pure teacher scope', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'academic-load',
        branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
      };

      expect(() =>
        service.intersectRequestedScope(scope, {
          teacherId: 'another-teacher',
        }),
      ).toThrow(ForbiddenException);
    });

    it('allows a coordinator to filter any teacher within authorized centers', () => {
      expect(
        service.intersectRequestedScope(coordinatorScope, {
          teacherId: 'another-teacher',
        }),
      ).toEqual({
        domain: 'academic-load',
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
            teacherId: 'another-teacher',
          },
        ],
      });
    });

    it('intersects explicitly requested center departments', () => {
      expect(
        service.intersectRequestedScope(combinedScope, {
          centerDepartmentIds: [CENTER_DEPARTMENT_IDS[1]],
        }),
      ).toEqual({
        domain: 'academic-load',
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: [CENTER_DEPARTMENT_IDS[1]],
          },
        ],
      });
    });

    it('rejects any explicit center department outside the scope', () => {
      expect(() =>
        service.intersectRequestedScope(coordinatorScope, {
          centerDepartmentIds: [CENTER_DEPARTMENT_IDS[0], 'another-department'],
        }),
      ).toThrow(ForbiddenException);
    });

    it('rejects explicit center departments for a pure teacher branch', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'academic-load',
        branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
      };

      expect(() =>
        service.intersectRequestedScope(scope, {
          centerDepartmentIds: [CENTER_DEPARTMENT_IDS[0]],
        }),
      ).toThrow(ForbiddenException);
    });

    it('applies teacher and center filters conjunctively to a coordinator branch', () => {
      expect(
        service.intersectRequestedScope(combinedScope, {
          teacherId: TEACHER_ID,
          centerDepartmentIds: [CENTER_DEPARTMENT_IDS[0]],
        }),
      ).toEqual({
        domain: 'academic-load',
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: [CENTER_DEPARTMENT_IDS[0]],
            teacherId: TEACHER_ID,
          },
        ],
      });
    });

    it('keeps the safe coordinator branch for a foreign teacher on combined roles', () => {
      expect(
        service.intersectRequestedScope(combinedScope, {
          teacherId: 'another-teacher',
        }),
      ).toEqual({
        domain: 'academic-load',
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
            teacherId: 'another-teacher',
          },
        ],
      });
    });

    it('preserves the safe union of combined branches without filters', () => {
      expect(service.intersectRequestedScope(combinedScope)).toEqual(
        combinedScope,
      );
    });

    it('intersects explicitly requested buildings', () => {
      expect(
        service.intersectRequestedScope(buildingScope, {
          buildingIds: ['building-2'],
        }),
      ).toEqual({
        domain: 'monitoring',
        branches: [
          {
            type: 'buildings',
            buildingIds: ['building-2'],
            centerDepartmentIds: [],
          },
        ],
      });
    });

    it('rejects any explicitly requested building outside the scope', () => {
      expect(() =>
        service.intersectRequestedScope(buildingScope, {
          buildingIds: ['building-1', 'another-building'],
        }),
      ).toThrow(ForbiddenException);
    });

    it('rejects explicit filters when the user has no scope', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'technology',
        branches: [],
      };

      expect(() =>
        service.intersectRequestedScope(scope, { teacherId: TEACHER_ID }),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.intersectRequestedScope(scope, {
          centerDepartmentIds: CENTER_DEPARTMENT_IDS,
        }),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.intersectRequestedScope(scope, {
          buildingIds: ['building-1'],
        }),
      ).toThrow(ForbiddenException);
    });

    it('keeps an empty effective scope when there is no applicable permission', () => {
      const scope: AnalyticsDomainScope = {
        domain: 'monitoring',
        branches: [],
      };

      expect(service.intersectRequestedScope(scope)).toEqual({
        domain: 'monitoring',
        branches: [],
      });
    });
  });
});
