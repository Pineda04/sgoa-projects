import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EUserRole } from 'src/common/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { EPosition } from 'src/modules/teachers-config/enums';
import { AnalyticsScopeService } from '../analytics-scope.service';
import { AnalyticsDomainScope } from '../../types';

const USER_ID = 'user-id';
const TEACHER_ID = 'teacher-id';
const CENTER_DEPARTMENT_IDS = ['center-department-1', 'center-department-2'];

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
    roles: EUserRole[],
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
        userRoles: roles.map((name) => ({ role: { name } })),
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
    it('reloads the active user, current roles and current department-head appointments', async () => {
      mockUser([EUserRole.COORDINADOR_AREA]);

      await service.getDomainScope(USER_ID, 'staff');

      const query = lastScopeUserQuery as ScopeUserQuery;
      const appointmentStart = query.select.teacher.select.positionHeld.where
        .startDate?.lte as Date;

      expect(appointmentStart).toBeInstanceOf(Date);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: USER_ID, activeStatus: true },
        select: {
          id: true,
          userRoles: { select: { role: { select: { name: true } } } },
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
    ] as const)('grants ADMIN global scope for %s', async (domain) => {
      mockUser([EUserRole.ADMIN]);

      await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
        domain,
        branches: [{ type: 'global' }],
      });
    });

    it('makes ADMIN prevail over all combined roles', async () => {
      mockUser([
        EUserRole.DOCENTE,
        EUserRole.COORDINADOR_AREA,
        EUserRole.ADMIN,
      ]);

      await expect(
        service.getDomainScope(USER_ID, 'academic-load'),
      ).resolves.toEqual({
        domain: 'academic-load',
        branches: [{ type: 'global' }],
      });
    });

    it('grants DIRECCION global scope in every domain', async () => {
      mockUser([EUserRole.DIRECCION]);

      for (const domain of [
        'academic-load',
        'enrollment',
        'classrooms',
        'staff',
        'technology',
        'activities',
        'monitoring',
      ] as const) {
        await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
          domain,
          branches: [{ type: 'global' }],
        });
      }
    });

    it.each(['academic-load', 'staff'] as const)(
      'grants RRHH global scope for %s',
      async (domain) => {
        mockUser([EUserRole.RRHH]);

        await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
          domain,
          branches: [{ type: 'global' }],
        });
      },
    );

    it.each([
      'enrollment',
      'classrooms',
      'technology',
      'activities',
      'monitoring',
    ] as const)('does not expand RRHH into %s', async (domain) => {
      mockUser([EUserRole.RRHH]);

      await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
        domain,
        branches: [],
      });
    });

    it('normalizes a global domain grant when RRHH has another role', async () => {
      mockUser([EUserRole.RRHH, EUserRole.DOCENTE]);

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
      'activities',
    ] as const)(
      'grants DOCENTE only the own teacher branch for %s',
      async (domain) => {
        mockUser([EUserRole.DOCENTE]);

        await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
          domain,
          branches: [{ type: 'teacher', teacherId: TEACHER_ID }],
        });
      },
    );

    it.each(['staff', 'technology', 'monitoring'] as const)(
      'does not expand DOCENTE into %s',
      async (domain) => {
        mockUser([EUserRole.DOCENTE]);

        await expect(service.getDomainScope(USER_ID, domain)).resolves.toEqual({
          domain,
          branches: [],
        });
      },
    );

    it('grants COORDINADOR_AREA only current department-head center departments', async () => {
      mockUser([EUserRole.COORDINADOR_AREA]);

      await expect(
        service.getDomainScope(USER_ID, 'technology'),
      ).resolves.toEqual({
        domain: 'technology',
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
          },
        ],
      });
    });

    it('does not grant a coordinator branch without a current appointment', async () => {
      mockUser([EUserRole.COORDINADOR_AREA], { centerDepartmentIds: [] });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('excludes a department-head appointment that starts in the future', async () => {
      mockUser([EUserRole.COORDINADOR_AREA], {
        futureAppointmentOnly: true,
      });

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
    });

    it('excludes an appointment whose end date has passed', async () => {
      mockUser([EUserRole.COORDINADOR_AREA], {
        expiredAppointmentOnly: true,
      });

      await expect(
        service.getDomainScope(USER_ID, 'enrollment'),
      ).resolves.toEqual({ domain: 'enrollment', branches: [] });
    });

    it('keeps combined role branches in their own domains', async () => {
      mockUser([EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA]);

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
        branches: [
          {
            type: 'centerDepartments',
            centerDepartmentIds: CENTER_DEPARTMENT_IDS,
          },
        ],
      });
    });

    it('gives MONITOR no scope in monitoring until building assignments exist', async () => {
      mockUser([EUserRole.MONITOR]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({ domain: 'monitoring', branches: [] });
    });

    it('limits MONITOR monitoring to assigned buildings', async () => {
      mockUser([EUserRole.MONITOR], {
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

    it('gives no scope when the user has no role applicable to the domain', async () => {
      mockUser([]);

      await expect(
        service.getDomainScope(USER_ID, 'monitoring'),
      ).resolves.toEqual({ domain: 'monitoring', branches: [] });
    });

    it('uses database roles rather than any caller-provided role state', async () => {
      mockUser([EUserRole.MONITOR]);

      await expect(service.getDomainScope(USER_ID, 'staff')).resolves.toEqual({
        domain: 'staff',
        branches: [],
      });
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

    it('rejects explicit filters when the role has no scope', () => {
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
    });

    it('keeps an empty effective scope when there is no applicable role', () => {
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
