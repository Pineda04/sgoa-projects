import { BadRequestException } from '@nestjs/common';
import { ActivityAnalyticsService } from '../activity-analytics.service';

describe('ActivityAnalyticsService', () => {
  type ReportQuery = {
    select: {
      complementaryActivities: {
        select: Record<string, boolean | object>;
      };
    };
  };
  const period = {
    id: 'period-1',
    year: 2026,
    pac: 1,
    pac_modality: 'Trimestre',
  };
  const reports = [
    {
      id: 'report-inactive',
      teacher: { id: 'inactive', user: { name: 'Anterior', code: 'A' } },
      period,
      centerDepartment: {
        id: 'center',
        center: { name: 'Centro' },
        department: { name: 'Departamento' },
      },
      complementaryActivities: [
        {
          id: 'activity-1',
          name: 'Actividad 1',
          progressLevel: 'Completa',
          isRegistered: true,
          activityType: { id: 'type-1', name: 'Tipo 1' },
        },
        {
          id: 'activity-2',
          name: 'Actividad 2',
          progressLevel: 'Completa',
          isRegistered: false,
          activityType: { id: 'type-1', name: 'Tipo 1' },
        },
      ],
    },
    {
      id: 'report-active-zero',
      teacher: { id: 'active-1', user: { name: 'Actual', code: 'B' } },
      period,
      centerDepartment: {
        id: 'center',
        center: { name: 'Centro' },
        department: { name: 'Departamento' },
      },
      complementaryActivities: [],
    },
  ];
  const reportFindMany = jest.fn<Promise<object[]>, [ReportQuery]>();
  const prisma = {
    academicPeriod: { findMany: jest.fn().mockResolvedValue([period]) },
    academicAssignmentReport: {
      findMany: reportFindMany,
      findFirst: jest.fn(),
    },
    activityType: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'type-1', name: 'Tipo 1' },
        { id: 'type-zero', name: 'Tipo sin actividades' },
      ]),
      findUnique: jest.fn(),
    },
    centerDepartment: { findUnique: jest.fn() },
    teacher: { findMany: jest.fn() },
  };
  const scopeService = {
    getDomainScope: jest.fn().mockResolvedValue({
      domain: 'activities',
      branches: [{ type: 'global' }],
    }),
    intersectRequestedScope: jest.fn().mockReturnValue({
      domain: 'activities',
      branches: [{ type: 'global' }],
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.academicPeriod.findMany.mockResolvedValue([period]);
    reportFindMany.mockResolvedValue(reports);
    prisma.activityType.findMany.mockResolvedValue([
      { id: 'type-1', name: 'Tipo 1' },
      { id: 'type-zero', name: 'Tipo sin actividades' },
    ]);
    prisma.teacher.findMany.mockResolvedValue([
      { id: 'active-1' },
      { id: 'active-2' },
    ]);
  });

  it('counts inactive historical reporters in the average but only active intersections in coverage', async () => {
    const service = new ActivityAnalyticsService(
      prisma as never,
      scopeService as never,
    );
    const result = await service.getSummary('user', { periodId: 'period-1' });

    expect(result.metrics.totalActivities.value).toBe(2);
    expect(result.metrics.reportedTeachers.value).toBe(2);
    expect(result.metrics.averageActivitiesPerReportedTeacher).toEqual(
      expect.objectContaining({ value: 1, numerator: 2, denominator: 2 }),
    );
    expect(result.metrics.activeTeacherReportCoverage).toEqual(
      expect.objectContaining({
        value: 50,
        numerator: 1,
        denominator: 2,
        dataStatus: 'partial',
      }),
    );
    expect(result.distributions.byType).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'type-zero', value: 0, percentage: 0 }),
      ]),
    );
  });

  it('selects no evidence or file metadata', async () => {
    const service = new ActivityAnalyticsService(
      prisma as never,
      scopeService as never,
    );
    await service.getSummary('user', { periodId: 'period-1' });
    const query = reportFindMany.mock.calls[0][0];
    const activitySelect = query.select.complementaryActivities.select;
    expect(activitySelect).not.toHaveProperty('fileNumber');
    expect(activitySelect).not.toHaveProperty('verificationMedia');
  });

  it('deduplicates annual report teachers and returns a real zero average', async () => {
    const secondPeriod = { ...period, id: 'period-2', pac: 2 };
    prisma.academicPeriod.findMany.mockResolvedValue([period, secondPeriod]);
    reportFindMany.mockResolvedValue([
      reports[1],
      { ...reports[1], id: 'report-active-zero-2', period: secondPeriod },
    ]);
    prisma.teacher.findMany.mockResolvedValue([{ id: 'active-1' }]);
    const service = new ActivityAnalyticsService(
      prisma as never,
      scopeService as never,
    );

    const result = await service.getSummary('user', { year: '2026' });

    expect(result.metrics.reportedTeachers.value).toBe(1);
    expect(result.metrics.averageActivitiesPerReportedTeacher).toEqual(
      expect.objectContaining({
        value: 0,
        numerator: 0,
        denominator: 1,
        dataStatus: 'complete',
      }),
    );
    expect(result.metrics.activeTeacherReportCoverage.value).toBe(100);
  });

  it.each([
    { filters: {}, label: 'missing both' },
    {
      filters: { periodId: 'period-1', year: '2026' },
      label: 'both temporal scopes',
    },
    {
      filters: { year: '2026', pac: '1' },
      label: 'PAC without modality',
    },
    {
      filters: { year: '2026', pacModality: 'Trimestre' },
      label: 'modality without PAC',
    },
    {
      filters: {
        periodId: 'period-1',
        pac: '1',
        pacModality: 'Trimestre',
      },
      label: 'PAC with period',
    },
  ])('rejects invalid temporal filters: $label', async ({ filters }) => {
    const service = new ActivityAnalyticsService(
      prisma as never,
      scopeService as never,
    );
    await expect(service.getSummary('user', filters)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
