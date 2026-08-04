import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnrollmentAnalyticsService } from '../enrollment-analytics.service';
import { AnalyticsScopeService } from '../analytics-scope.service';

const section = (
  id: string,
  studentCount: number | null,
  maxCapacity: number | null,
  options: {
    courseCode?: string;
    teacherName?: string;
    classroomName?: string;
  } = {},
) => ({
  id,
  groupCode: `G-${id}`,
  studentCount,
  course: {
    code: options.courseCode ?? `C-${id}`,
    name: `Course ${id}`,
  },
  classroom: {
    id: `classroom-${id}`,
    name: options.classroomName ?? `Classroom ${id}`,
    maxCapacity,
  },
  teachingSession: {
    assignmentReport: {
      teacher: {
        id: `teacher-${id}`,
        user: { name: options.teacherName ?? `Teacher ${id}` },
      },
    },
  },
});

describe('EnrollmentAnalyticsService', () => {
  let service: EnrollmentAnalyticsService;
  const prisma = {
    academicPeriod: { findMany: jest.fn() },
    academicAssignmentReport: { findFirst: jest.fn() },
    courseClassroom: { findMany: jest.fn() },
  };
  const scopeService = {
    getDomainScope: jest.fn(),
    intersectRequestedScope: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    scopeService.getDomainScope.mockResolvedValue({
      domain: 'enrollment',
      branches: [{ type: 'global' }],
    });
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'enrollment',
      branches: [{ type: 'global' }],
    });
    prisma.academicPeriod.findMany.mockImplementation(
      ({ where }: { where: { id: { in: string[] } } }) =>
        Promise.resolve(where.id.in.map((id) => ({ id }))),
    );

    const module = await Test.createTestingModule({
      providers: [
        EnrollmentAnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AnalyticsScopeService, useValue: scopeService },
      ],
    }).compile();
    service = module.get(EnrollmentAnalyticsService);
  });

  it('deduplicates sections and computes enrollment and capacity metrics', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('1', 20, 30),
      section('1', 20, 30),
      section('2', 40, 30),
    ]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-1',
    });

    expect(result.metrics.reportedEnrollments.value).toBe(60);
    expect(result.metrics.averageEnrollmentPerSection.value).toBe(30);
    expect(result.metrics.sectionsOverCapacity.value).toBe(1);
    expect(result.metrics.availablePhysicalSeats.value).toBe(10);
    expect(result.metrics.occupancyRate.value).toBe(100);
    expect(result.metrics.enrollmentDataCoverage.value).toBe(100);
    expect(result.metrics.reportedEnrollments.comparison).toBeNull();
    expect(result.metrics.sectionsOverCapacity.notes).toEqual([
      'current_classroom_capacity',
    ]);
    expect(result.metrics.availablePhysicalSeats.notes).toEqual([
      'current_classroom_capacity',
    ]);
    expect(result.metrics.occupancyRate.notes).toEqual([
      'current_classroom_capacity',
    ]);
    expect(result.metrics.reportedEnrollments.notes).toBeUndefined();
  });

  it('distinguishes partial coverage from unavailable enrollment data', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('1', 12, 20),
      section('2', null, 30),
    ]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-1',
    });

    expect(result.metrics.reportedEnrollments).toEqual(
      expect.objectContaining({
        value: 12,
        dataStatus: 'partial',
        coverage: {
          included: 1,
          total: 2,
          excluded: 1,
          reasons: ['missing_enrollment'],
        },
      }),
    );
    expect(result.metrics.enrollmentDataCoverage.value).toBe(50);

    prisma.courseClassroom.findMany.mockResolvedValue([section('1', null, 20)]);
    const unavailable = await service.getSummary('user-1', {
      periodId: 'period-1',
    });
    expect(unavailable.metrics.reportedEnrollments.value).toBeNull();
    expect(unavailable.metrics.reportedEnrollments.dataStatus).toBe(
      'unavailable',
    );
  });

  it('reports missing and invalid capacity separately and excludes both', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('1', 10, null),
      section('2', 10, 0),
      section('3', 15, 20),
    ]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-1',
    });

    expect(result.metrics.sectionsOverCapacity).toEqual(
      expect.objectContaining({
        value: 0,
        dataStatus: 'partial',
        coverage: {
          included: 1,
          total: 3,
          excluded: 2,
          reasons: ['missing_classroom_capacity', 'invalid_classroom_capacity'],
        },
      }),
    );
    expect(result.metrics.occupancyRate.value).toBe(75);
    expect(result.metrics.availablePhysicalSeats.value).toBe(5);
  });

  it('returns the specified zero and not-applicable semantics with no sections', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-1',
    });

    expect(result.metrics.reportedEnrollments).toEqual(
      expect.objectContaining({ value: 0, dataStatus: 'complete' }),
    );
    expect(result.metrics.sectionsOverCapacity).toEqual(
      expect.objectContaining({ value: 0, dataStatus: 'complete' }),
    );
    expect(result.metrics.availablePhysicalSeats).toEqual(
      expect.objectContaining({ value: 0, dataStatus: 'complete' }),
    );
    expect(result.metrics.averageEnrollmentPerSection).toEqual(
      expect.objectContaining({ value: null, dataStatus: 'not_applicable' }),
    );
    expect(result.metrics.occupancyRate.dataStatus).toBe('not_applicable');
    expect(result.metrics.enrollmentDataCoverage).toEqual(
      expect.objectContaining({ value: null, dataStatus: 'not_applicable' }),
    );
  });

  it('adds comparison to all six metrics and preserves unavailable values', async () => {
    prisma.courseClassroom.findMany
      .mockResolvedValueOnce([section('current', 30, 40)])
      .mockResolvedValueOnce([section('previous', null, 40)]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-2',
      comparisonPeriodId: 'period-1',
    });

    expect(result.metrics.reportedEnrollments.comparison).toEqual({
      current: 30,
      comparison: null,
      absoluteChange: null,
      percentageChange: null,
      currentDataStatus: 'complete',
      comparisonDataStatus: 'unavailable',
      currentCoverage: {
        included: 1,
        total: 1,
        excluded: 0,
        reasons: [],
      },
      comparisonCoverage: {
        included: 0,
        total: 1,
        excluded: 1,
        reasons: ['missing_enrollment'],
      },
    });
    expect(result.metrics.sectionsOverCapacity.comparison).toEqual(
      expect.objectContaining({
        currentDataStatus: 'complete',
        comparisonDataStatus: 'unavailable',
        comparisonCoverage: {
          included: 0,
          total: 1,
          excluded: 1,
          reasons: ['missing_enrollment'],
        },
      }),
    );
    expect(
      Object.values(result.metrics).every(
        (metric) => metric.comparison !== null,
      ),
    ).toBe(true);
  });

  it('keeps numeric deltas while exposing partial coverage in both periods', async () => {
    prisma.courseClassroom.findMany
      .mockResolvedValueOnce([
        section('current-known', 30, 40),
        section('current-missing', null, 40),
      ])
      .mockResolvedValueOnce([
        section('previous-known', 20, 40),
        section('previous-missing', null, null),
      ]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-2',
      comparisonPeriodId: 'period-1',
    });

    expect(result.metrics.reportedEnrollments.comparison).toEqual(
      expect.objectContaining({
        current: 30,
        comparison: 20,
        absoluteChange: 10,
        percentageChange: 50,
        currentDataStatus: 'partial',
        comparisonDataStatus: 'partial',
      }),
    );
    expect(
      result.metrics.reportedEnrollments.comparison?.currentCoverage,
    ).toEqual(expect.objectContaining({ included: 1, total: 2 }));
    expect(
      result.metrics.reportedEnrollments.comparison?.comparisonCoverage,
    ).toEqual(expect.objectContaining({ included: 1, total: 2 }));
  });

  it('returns nullable derived fields in enrollment capacity details', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('1', 35, 30),
      section('2', null, 25),
      section('3', 10, 0),
    ]);

    const result = await service.getDetails('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
    });

    expect(result.periodId).toBe('period-1');
    expect(result.notes).toEqual(['current_classroom_capacity']);

    expect(result.rows[0]).toEqual({
      sectionId: '1',
      courseCode: 'C-1',
      courseName: 'Course 1',
      groupCode: 'G-1',
      teacherId: 'teacher-1',
      teacherName: 'Teacher 1',
      classroomId: 'classroom-1',
      classroomName: 'Classroom 1',
      studentCount: 35,
      maxCapacity: 30,
      occupancyRate: (35 / 30) * 100,
      availableSeats: 0,
      overCapacity: true,
    });
    expect(result.rows[1]).toEqual(
      expect.objectContaining({
        studentCount: null,
        occupancyRate: null,
        availableSeats: null,
        overCapacity: null,
      }),
    );
    expect(result.rows[2]).toEqual(
      expect.objectContaining({
        maxCapacity: 0,
        occupancyRate: null,
        availableSeats: null,
        overCapacity: null,
      }),
    );
  });

  it('sorts stably and paginates details after deduplication', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('2', 20, 40, { teacherName: 'Ana' }),
      section('1', 10, 40, { teacherName: 'Ana' }),
      section('3', null, 40, { teacherName: 'Zoe' }),
      section('1', 10, 40, { teacherName: 'Ana' }),
    ]);

    const result = await service.getDetails('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
      page: '2',
      size: '1',
      sort: 'teacherName:asc',
    });

    expect(result.rows.map(({ sectionId }) => sectionId)).toEqual(['2']);
    expect(result.meta).toEqual({ page: 2, size: 1, total: 3 });
  });

  it('exports every detail row using the same stable ordering pipeline', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('2', 20, 40, { teacherName: 'Ana' }),
      section('1', 10, 40, { teacherName: 'Ana' }),
      section('3', null, 40, { teacherName: 'Zoe' }),
      section('1', 10, 40, { teacherName: 'Ana' }),
    ]);

    const details = await service.getDetails('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
      page: '2',
      size: '1',
      sort: 'teacherName:asc',
    });
    const exportRows = await service.getExportRows('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
      sort: 'teacherName:asc',
    });

    expect(details.rows).toEqual(exportRows.slice(1, 2));
    expect(exportRows.map(({ sectionId }) => sectionId)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  it.each([
    { page: '0', size: '25' },
    { page: '1.5', size: '25' },
    { page: '1', size: '101' },
  ])('rejects invalid pagination %#', async ({ page, size }) => {
    await expect(
      service.getDetails('user-1', {
        metric: 'enrollment_capacity',
        periodId: 'period-1',
        page,
        size,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects comparisonPeriodId explicitly in enrollment details', async () => {
    const filters = {
      metric: 'enrollment_capacity' as const,
      periodId: 'period-1',
      comparisonPeriodId: 'period-2',
    };

    await expect(service.getDetails('user-1', filters)).rejects.toThrow(
      '<comparisonPeriodId> no está soportado en el detalle de matrícula.',
    );
    expect(scopeService.getDomainScope).not.toHaveBeenCalled();
  });

  it('rejects equal periods before resolving scope', async () => {
    await expect(
      service.getSummary('user-1', {
        periodId: 'period-1',
        comparisonPeriodId: 'period-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(scopeService.getDomainScope).not.toHaveBeenCalled();
  });

  it('rejects empty scope and a coordinator teacher outside allowed centers', async () => {
    scopeService.intersectRequestedScope.mockReturnValueOnce({
      domain: 'enrollment',
      branches: [],
    });
    await expect(
      service.getSummary('user-1', { periodId: 'period-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'enrollment',
      branches: [
        {
          type: 'centerDepartments',
          centerDepartmentIds: ['center-1'],
          teacherId: 'foreign-teacher',
        },
      ],
    });
    prisma.academicAssignmentReport.findFirst.mockResolvedValue(null);
    await expect(
      service.getSummary('user-1', {
        periodId: 'period-1',
        centerDepartmentId: 'center-1',
        teacherId: 'foreign-teacher',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('uses the effective scope in the period-constrained safe where', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'enrollment',
      branches: [
        {
          type: 'centerDepartments',
          centerDepartmentIds: ['center-1'],
        },
      ],
    });
    prisma.courseClassroom.findMany.mockResolvedValue([]);

    await service.getSummary('user-1', {
      periodId: 'period-1',
      centerDepartmentId: 'center-1',
    });

    expect(prisma.courseClassroom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              teachingSession: {
                assignmentReport: {
                  periodId: 'period-1',
                  centerDepartmentId: { in: ['center-1'] },
                },
              },
            },
          ],
        },
      }),
    );
  });
});
