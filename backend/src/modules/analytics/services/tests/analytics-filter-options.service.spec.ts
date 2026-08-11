import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsFilterOptionsService } from '../analytics-filter-options.service';
import { AnalyticsScopeService } from '../analytics-scope.service';
import { EPosition } from 'src/modules/teachers-config/enums';

describe('AnalyticsFilterOptionsService', () => {
  let service: AnalyticsFilterOptionsService;
  const prisma = {
    academicPeriod: { findMany: jest.fn() },
    centerDepartment: { findMany: jest.fn() },
    academicAssignmentReport: { findMany: jest.fn() },
    teacher: { findMany: jest.fn() },
    contractType: { findMany: jest.fn() },
    teacherCategory: { findMany: jest.fn() },
    shift: { findMany: jest.fn() },
    position: { findMany: jest.fn() },
    activityType: { findMany: jest.fn() },
  };
  const scopeService = {
    getDomainScopes: jest.fn<
      ReturnType<AnalyticsScopeService['getDomainScopes']>,
      Parameters<AnalyticsScopeService['getDomainScopes']>
    >(),
    intersectRequestedScope: jest.fn<
      ReturnType<AnalyticsScopeService['intersectRequestedScope']>,
      Parameters<AnalyticsScopeService['intersectRequestedScope']>
    >(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.academicPeriod.findMany.mockResolvedValue([]);
    prisma.centerDepartment.findMany.mockResolvedValue([]);
    prisma.academicAssignmentReport.findMany.mockResolvedValue([]);
    prisma.teacher.findMany.mockResolvedValue([]);
    prisma.contractType.findMany.mockResolvedValue([]);
    prisma.teacherCategory.findMany.mockResolvedValue([]);
    prisma.shift.findMany.mockResolvedValue([]);
    prisma.position.findMany.mockResolvedValue([]);
    prisma.activityType.findMany.mockResolvedValue([]);
    const module = await Test.createTestingModule({
      providers: [
        AnalyticsFilterOptionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AnalyticsScopeService, useValue: scopeService },
      ],
    }).compile();
    service = module.get(AnalyticsFilterOptionsService);
  });

  it('returns a technology context with authorized centers and no teacher filter', async () => {
    const technologyScope = {
      domain: 'technology' as const,
      branches: [
        { type: 'centerDepartments' as const, centerDepartmentIds: ['cd-1'] },
      ],
    };
    scopeService.getDomainScopes.mockResolvedValue([technologyScope]);
    scopeService.intersectRequestedScope.mockReturnValue(technologyScope);
    prisma.centerDepartment.findMany.mockResolvedValue([
      {
        id: 'cd-1',
        center: { name: 'Centro' },
        department: { name: 'Departamento' },
      },
    ]);

    const result = await service.getOptions('coordinator-user');

    expect(result.domainContexts.technology).toEqual(
      expect.objectContaining({
        filters: {
          centerDepartmentId: 'locked',
          teacherId: 'hidden',
        },
        options: {
          centerDepartments: [
            expect.objectContaining({
              id: 'cd-1',
              label: 'Centro - Departamento',
            }),
          ],
          teachers: [],
        },
      }),
    );
    expect(result.capabilities.canExport).toBe(true);
    expect(prisma.academicAssignmentReport.findMany).not.toHaveBeenCalled();
  });

  it('locks a teacher to self and never queries or returns other teachers', async () => {
    scopeService.getDomainScopes.mockResolvedValue([
      {
        domain: 'academic-load',
        branches: [{ type: 'teacher', teacherId: 'teacher-1' }],
      },
      {
        domain: 'enrollment',
        branches: [{ type: 'teacher', teacherId: 'teacher-1' }],
      },
    ]);
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [{ type: 'teacher', teacherId: 'teacher-1' }],
    });
    prisma.academicAssignmentReport.findMany.mockResolvedValue([
      {
        teacher: {
          id: 'teacher-1',
          user: { name: 'Propio', code: '001' },
        },
      },
    ]);

    const result = await service.getOptions('user-1');

    expect(result.filters.teacherId).toBe('locked');
    expect(result.domains).toEqual(['academic-load', 'enrollment']);
    expect(result.defaults.teacherId).toBe('teacher-1');
    expect(result.options.teachers.map(({ id }) => id)).toEqual(['teacher-1']);
    expect(result.capabilities.canExport).toBe(true);
    expect(result.domainContexts.enrollment).toEqual(
      expect.objectContaining({
        filters: {
          centerDepartmentId: 'hidden',
          teacherId: 'locked',
        },
        defaults: {
          centerDepartmentId: null,
          teacherId: 'teacher-1',
        },
      }),
    );
    expect(prisma.academicAssignmentReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ teacherId: 'teacher-1' }] },
      }),
    );
  });

  it('returns no academic catalogs or capability for a role without the domain', async () => {
    scopeService.getDomainScopes.mockResolvedValue([
      { domain: 'academic-load', branches: [] },
    ]);
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [],
    });

    const result = await service.getOptions('monitor-user');

    expect(result.domains).toEqual([]);
    expect(result.filters.teacherId).toBe('hidden');
    expect(result.options.centerDepartments).toEqual([]);
    expect(result.options.teachers).toEqual([]);
    expect(result.capabilities).toEqual({
      canComparePeriods: false,
      canExport: false,
    });
  });

  it('returns current staff options and catalogs only for an authorized staff context', async () => {
    const staffScope = {
      domain: 'staff' as const,
      branches: [{ type: 'global' as const }],
    };
    scopeService.getDomainScopes.mockResolvedValue([staffScope]);
    scopeService.intersectRequestedScope.mockReturnValue(staffScope);
    prisma.teacher.findMany.mockResolvedValue([
      { id: 'teacher-1', user: { name: 'Docente', code: '001' } },
    ]);
    prisma.contractType.findMany.mockResolvedValue([
      { id: 'contract-1', name: 'Contrato' },
    ]);
    prisma.teacherCategory.findMany.mockResolvedValue([
      { id: 'category-1', name: 'Categoría' },
    ]);
    prisma.shift.findMany.mockResolvedValue([
      { id: 'shift-1', name: 'Jornada' },
    ]);
    prisma.position.findMany.mockResolvedValue([
      { id: 'position-1', name: 'Cargo' },
      { id: 'position-none', name: EPosition.NONE },
    ]);

    const result = await service.getOptions('rrhh-user');

    expect(
      result.domainContexts.staff?.options.teachers.map(({ id }) => id),
    ).toEqual(['teacher-1']);
    expect(result.domainContexts.staff?.catalogs).toEqual({
      contractTypes: [{ id: 'contract-1', label: 'Contrato' }],
      categories: [{ id: 'category-1', label: 'Categoría' }],
      shifts: [{ id: 'shift-1', label: 'Jornada' }],
      positions: [
        { id: 'position-1', label: 'Cargo' },
        { id: 'position-none', label: 'Sin cargo académico vigente' },
      ],
    });
    expect(prisma.position.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    expect(prisma.teacher.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user: { activeStatus: true } } }),
    );
    expect(result.domainContexts.activities).toBeUndefined();
    expect(prisma.activityType.findMany).not.toHaveBeenCalled();
  });

  it('returns report teachers, activity types and available years for activities', async () => {
    const activitiesScope = {
      domain: 'activities' as const,
      branches: [{ type: 'teacher' as const, teacherId: 'teacher-1' }],
    };
    scopeService.getDomainScopes.mockResolvedValue([activitiesScope]);
    scopeService.intersectRequestedScope.mockReturnValue(activitiesScope);
    prisma.academicPeriod.findMany.mockResolvedValue([
      {
        id: 'period-1',
        year: 2026,
        pac: 1,
        pac_modality: 'Trimestre',
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-04-01T00:00:00.000Z'),
      },
      {
        id: 'period-2',
        year: 2026,
        pac: 2,
        pac_modality: 'Trimestre',
        startDate: new Date('2026-05-01T00:00:00.000Z'),
        endDate: new Date('2026-08-01T00:00:00.000Z'),
      },
    ]);
    prisma.academicAssignmentReport.findMany.mockResolvedValue([
      {
        teacher: {
          id: 'teacher-1',
          user: { name: 'Propio', code: '001' },
        },
      },
    ]);
    prisma.activityType.findMany.mockResolvedValue([
      { id: 'type-1', name: 'Tipo' },
    ]);

    const result = await service.getOptions('teacher-user');

    expect(result.domainContexts.activities).toEqual(
      expect.objectContaining({
        filters: { centerDepartmentId: 'hidden', teacherId: 'locked' },
        catalogs: {
          activityTypes: [{ id: 'type-1', label: 'Tipo' }],
          availableYears: [2026],
        },
      }),
    );
    expect(result.capabilities.canExport).toBe(true);
    expect(result.domainContexts.staff).toBeUndefined();
    expect(prisma.contractType.findMany).not.toHaveBeenCalled();
  });

  it('restricts coordinator catalogs to effective centers and assigned teachers', async () => {
    scopeService.getDomainScopes.mockResolvedValue([
      {
        domain: 'academic-load',
        branches: [
          { type: 'centerDepartments', centerDepartmentIds: ['center-1'] },
        ],
      },
    ]);
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [
        { type: 'centerDepartments', centerDepartmentIds: ['center-1'] },
      ],
    });

    const result = await service.getOptions('coordinator-user', 'center-1');

    expect(prisma.centerDepartment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['center-1'] } } }),
    );
    expect(prisma.academicAssignmentReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ centerDepartmentId: { in: ['center-1'] } }],
        },
      }),
    );
    expect(result.filters.centerDepartmentId).toBe('locked');
    expect(result.defaults.centerDepartmentId).toBe('center-1');
  });

  it('unions own-teacher and coordinated-center branches without a selected center', async () => {
    scopeService.getDomainScopes.mockResolvedValue([
      {
        domain: 'academic-load',
        branches: [
          { type: 'teacher', teacherId: 'teacher-1' },
          {
            type: 'centerDepartments',
            centerDepartmentIds: ['center-1', 'center-2'],
          },
        ],
      },
    ]);
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [
        { type: 'teacher', teacherId: 'teacher-1' },
        {
          type: 'centerDepartments',
          centerDepartmentIds: ['center-1', 'center-2'],
        },
      ],
    });

    const result = await service.getOptions('combined-user');

    expect(prisma.academicAssignmentReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { teacherId: 'teacher-1' },
            { centerDepartmentId: { in: ['center-1', 'center-2'] } },
          ],
        },
      }),
    );
    expect(result.filters.centerDepartmentId).toBe('selectable');
    expect(result.defaults.centerDepartmentId).toBeNull();
  });

  describe.each(['ADMIN', 'DIRECCION', 'RRHH'])(
    '%s global filter options',
    (role) => {
      beforeEach(() => {
        scopeService.getDomainScopes.mockResolvedValue([
          {
            domain: 'academic-load',
            branches: [{ type: 'global' }],
          },
        ]);
        prisma.academicAssignmentReport.findMany.mockResolvedValue([
          {
            teacher: {
              id: `${role}-teacher`,
              user: { name: `Docente ${role}`, code: role },
            },
          },
        ]);
      });

      it('queries all teachers directly when no center is selected', async () => {
        scopeService.intersectRequestedScope.mockReturnValue({
          domain: 'academic-load',
          branches: [{ type: 'global' }],
        });

        const result = await service.getOptions(`${role}-user`);

        expect(prisma.academicAssignmentReport.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: {} }),
        );
        expect(result.options.teachers.map(({ id }) => id)).toEqual([
          `${role}-teacher`,
        ]);
        expect(result.filters.centerDepartmentId).toBe('selectable');
        expect(result.defaults.centerDepartmentId).toBeNull();
      });

      it('applies a requested center directly without an OR branch', async () => {
        scopeService.intersectRequestedScope.mockReturnValue({
          domain: 'academic-load',
          branches: [
            {
              type: 'global',
              centerDepartmentIds: ['center-1'],
            },
          ],
        });

        const result = await service.getOptions(`${role}-user`, 'center-1');

        expect(prisma.academicAssignmentReport.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { centerDepartmentId: { in: ['center-1'] } },
          }),
        );
        expect(result.options.teachers.map(({ id }) => id)).toEqual([
          `${role}-teacher`,
        ]);
        expect(result.defaults.centerDepartmentId).toBe('center-1');
      });
    },
  );

  it('keeps RRHH academic catalogs global while locking enrollment to the own teacher', async () => {
    const academicScope = {
      domain: 'academic-load' as const,
      branches: [{ type: 'global' as const }],
    };
    const enrollmentScope = {
      domain: 'enrollment' as const,
      branches: [{ type: 'teacher' as const, teacherId: 'teacher-own' }],
    };
    scopeService.getDomainScopes.mockResolvedValue([
      academicScope,
      enrollmentScope,
    ]);
    scopeService.intersectRequestedScope.mockImplementation(
      (scope, requested) => ({
        ...scope,
        branches:
          scope.domain === 'academic-load'
            ? [{ type: 'global', ...requested }]
            : scope.branches,
      }),
    );
    prisma.academicAssignmentReport.findMany
      .mockResolvedValueOnce([
        {
          teacher: {
            id: 'teacher-other',
            user: { name: 'Otro', code: '002' },
          },
        },
        {
          teacher: {
            id: 'teacher-own',
            user: { name: 'Propio', code: '001' },
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          teacher: {
            id: 'teacher-own',
            user: { name: 'Propio', code: '001' },
          },
        },
      ]);

    const result = await service.getOptions('combined-user', 'center-global');

    expect(result.filters.teacherId).toBe('selectable');
    expect(result.options.teachers.map(({ id }) => id)).toEqual([
      'teacher-other',
      'teacher-own',
    ]);
    expect(result.domainContexts.enrollment).toEqual({
      filters: { centerDepartmentId: 'hidden', teacherId: 'locked' },
      defaults: { centerDepartmentId: null, teacherId: 'teacher-own' },
      options: {
        centerDepartments: [],
        teachers: [
          {
            id: 'teacher-own',
            label: '001 - Propio',
            name: 'Propio',
            code: '001',
          },
        ],
      },
    });
    expect(scopeService.intersectRequestedScope).toHaveBeenNthCalledWith(
      2,
      enrollmentScope,
      {},
    );
  });

  it('keeps the safe own-teacher and coordinated-center union per domain', async () => {
    const branches = [
      { type: 'teacher' as const, teacherId: 'teacher-own' },
      {
        type: 'centerDepartments' as const,
        centerDepartmentIds: ['center-1', 'center-2'],
      },
    ];
    scopeService.getDomainScopes.mockResolvedValue([
      { domain: 'academic-load', branches },
      { domain: 'enrollment', branches },
    ]);
    scopeService.intersectRequestedScope.mockImplementation((scope) => scope);
    prisma.academicAssignmentReport.findMany.mockResolvedValue([
      {
        teacher: {
          id: 'teacher-own',
          user: { name: 'Propio', code: '001' },
        },
      },
    ]);

    const result = await service.getOptions('teacher-coordinator');

    expect(result.domainContexts.enrollment?.filters).toEqual({
      centerDepartmentId: 'selectable',
      teacherId: 'selectable',
    });
    expect(prisma.academicAssignmentReport.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          OR: [
            { teacherId: 'teacher-own' },
            { centerDepartmentId: { in: ['center-1', 'center-2'] } },
          ],
        },
      }),
    );
  });

  it('adds a classrooms context and ignores a requested center invalid only for that domain', async () => {
    const classroomsScope = {
      domain: 'classrooms' as const,
      branches: [
        { type: 'centerDepartments' as const, centerDepartmentIds: ['cd-1'] },
      ],
    };
    scopeService.getDomainScopes.mockResolvedValue([classroomsScope]);
    scopeService.intersectRequestedScope.mockReturnValue(classroomsScope);

    const result = await service.getOptions('coordinator', 'cd-other');

    expect(scopeService.intersectRequestedScope).toHaveBeenCalledWith(
      classroomsScope,
      {},
    );
    expect(result.domainContexts.classrooms?.defaults.centerDepartmentId).toBe(
      'cd-1',
    );
    expect(result.domainContexts.classrooms?.filters.teacherId).toBe('hidden');
    expect(result.domainContexts.classrooms?.options.teachers).toEqual([]);
    expect(result.domainContexts.classrooms?.defaults.teacherId).toBeNull();
    expect(result.filters.centerDepartmentId).toBe('hidden');
    expect(result.capabilities.canExport).toBe(true);
    expect(prisma.academicAssignmentReport.findMany).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: 'global',
      branches: [{ type: 'global' as const }],
      centerFilter: 'selectable',
      centerDefault: null,
    },
    {
      label: 'coordinator',
      branches: [
        { type: 'centerDepartments' as const, centerDepartmentIds: ['cd-1'] },
      ],
      centerFilter: 'locked',
      centerDefault: 'cd-1',
    },
    {
      label: 'teacher',
      branches: [{ type: 'teacher' as const, teacherId: 'teacher-1' }],
      centerFilter: 'hidden',
      centerDefault: null,
    },
  ])(
    'hides classroom teacher controls while preserving $label center context',
    async ({ branches, centerFilter, centerDefault }) => {
      const classroomsScope = {
        domain: 'classrooms' as const,
        branches,
      };
      scopeService.getDomainScopes.mockResolvedValue([classroomsScope]);
      scopeService.intersectRequestedScope.mockReturnValue(classroomsScope);

      const result = await service.getOptions('user');
      const context = result.domainContexts.classrooms;

      expect(context?.filters).toEqual({
        centerDepartmentId: centerFilter,
        teacherId: 'hidden',
      });
      expect(context?.defaults).toEqual({
        centerDepartmentId: centerDefault,
        teacherId: null,
      });
      expect(context?.options.teachers).toEqual([]);
      expect(prisma.academicAssignmentReport.findMany).not.toHaveBeenCalled();
    },
  );
});
