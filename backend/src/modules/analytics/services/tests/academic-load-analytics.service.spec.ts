import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AcademicLoadAnalyticsService } from '../academic-load-analytics.service';
import { AnalyticsScopeService } from '../analytics-scope.service';

const section = (
  id: string,
  courseId: string,
  uvs: number,
  teacherId: string,
  name = teacherId,
  days = 'Lu',
  schedule = '08:00 - 10:00',
) => ({
  id,
  days,
  section: schedule,
  course: { id: courseId, uvs },
  teachingSession: {
    assignmentReport: {
      teacher: { id: teacherId, user: { name, code: `C-${teacherId}` } },
    },
  },
});

describe('AcademicLoadAnalyticsService', () => {
  let service: AcademicLoadAnalyticsService;
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
      domain: 'academic-load',
      branches: [{ type: 'global' }],
    });
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [{ type: 'global' }],
    });
    prisma.academicPeriod.findMany.mockImplementation(
      ({ where }: { where: { id: { in: string[] } } }) =>
        Promise.resolve(where.id.in.map((id) => ({ id }))),
    );

    const module = await Test.createTestingModule({
      providers: [
        AcademicLoadAnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AnalyticsScopeService, useValue: scopeService },
      ],
    }).compile();
    service = module.get(AcademicLoadAnalyticsService);
  });

  it('deduplicates sections, sums UV per section, and computes teacher averages', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('s1', 'course-1', 4, 'teacher-1'),
      section('s1', 'course-1', 4, 'teacher-1'),
      section('s2', 'course-1', 4, 'teacher-2'),
      section('s3', 'course-2', 3, 'teacher-2'),
    ]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-1',
    });

    expect(result.metrics.offeredSections.value).toBe(3);
    expect(result.metrics.distinctCourses.value).toBe(2);
    expect(result.metrics.assignedUvs.value).toBe(11);
    expect(result.metrics.assignedTeachers.value).toBe(2);
    expect(result.metrics.averageSectionsPerTeacher.value).toBe(1.5);
    expect(result.metrics.averageUvsPerTeacher.value).toBe(5.5);
  });

  it('groups one meeting per valid day and deduplicates sections before counting', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section(
        's1',
        'course-1',
        4,
        'teacher-1',
        'A',
        'LuMi',
        '8:00 AM - 9:30 AM',
      ),
      section(
        's1',
        'course-1',
        4,
        'teacher-1',
        'A',
        'LuMi',
        '8:00 AM - 9:30 AM',
      ),
      section('s2', 'course-2', 3, 'teacher-2', 'B', 'Mi', '08:00 - 09:30'),
      section('s3', 'course-3', 2, 'teacher-3', 'C', 'Do', '23:00 - 23:59'),
    ]);

    const result = await service.getSummary('user-1', { periodId: 'period-1' });

    expect(result.scheduleDistribution).toEqual({
      items: [
        {
          dayOfWeek: 'Lu',
          startTime: '08:00',
          endTime: '09:30',
          meetingCount: 1,
        },
        {
          dayOfWeek: 'Mi',
          startTime: '08:00',
          endTime: '09:30',
          meetingCount: 2,
        },
        {
          dayOfWeek: 'Do',
          startTime: '23:00',
          endTime: '23:59',
          meetingCount: 1,
        },
      ],
      coverage: { included: 3, total: 3, excluded: 0, reasons: [] },
      dataStatus: 'complete',
    });
  });

  it('reports each invalid schedule reason once and returns partial data', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('valid', 'course-1', 4, 'teacher-1', 'A', 'Sa', '00:00 - 00:01'),
      section(
        'bad-days',
        'course-2',
        3,
        'teacher-2',
        'B',
        'XX',
        '08:00 - 09:00',
      ),
      section(
        'bad-section',
        'course-3',
        2,
        'teacher-3',
        'C',
        'Lu',
        '09:00 - 09:00',
      ),
    ]);

    const result = await service.getSummary('user-1', { periodId: 'period-1' });

    expect(result.scheduleDistribution).toEqual({
      items: [
        {
          dayOfWeek: 'Sa',
          startTime: '00:00',
          endTime: '00:01',
          meetingCount: 1,
        },
      ],
      coverage: {
        included: 1,
        total: 3,
        excluded: 2,
        reasons: ['invalid_schedule_days', 'invalid_schedule_section'],
      },
      dataStatus: 'partial',
    });
  });

  it('marks schedule distribution unavailable when every unique section is invalid', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('s1', 'course-1', 4, 'teacher-1', 'A', '', 'invalid'),
    ]);

    const result = await service.getSummary('user-1', { periodId: 'period-1' });

    expect(result.scheduleDistribution).toEqual({
      items: [],
      coverage: {
        included: 0,
        total: 1,
        excluded: 1,
        reasons: ['invalid_schedule_days', 'invalid_schedule_section'],
      },
      dataStatus: 'unavailable',
    });
  });

  it('returns complete empty schedule coverage when there are no sections', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([]);

    const result = await service.getSummary('user-1', { periodId: 'period-1' });

    expect(result.scheduleDistribution).toEqual({
      items: [],
      coverage: { included: 0, total: 0, excluded: 0, reasons: [] },
      dataStatus: 'complete',
    });
  });

  it('returns a null percentage change when the comparison base is zero', async () => {
    prisma.courseClassroom.findMany
      .mockResolvedValueOnce([section('s1', 'course-1', 4, 'teacher-1')])
      .mockResolvedValueOnce([]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-2',
      comparisonPeriodId: 'period-1',
    });

    expect(result.metrics.offeredSections.comparison).toEqual({
      current: 1,
      comparison: 0,
      absoluteChange: 1,
      percentageChange: null,
      currentDataStatus: 'complete',
      comparisonDataStatus: 'complete',
    });
    expect(result.metrics.assignedUvs.comparison?.percentageChange).toBeNull();
    expect(
      Object.values(result.metrics).every((metric) => metric.comparison),
    ).toBe(true);
  });

  it('returns null changes when either comparable value is unavailable', async () => {
    prisma.courseClassroom.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([section('s1', 'course-1', 4, 'teacher-1')]);

    const result = await service.getSummary('user-1', {
      periodId: 'period-2',
      comparisonPeriodId: 'period-1',
    });

    expect(result.metrics.averageSectionsPerTeacher.comparison).toEqual({
      current: null,
      comparison: 1,
      absoluteChange: null,
      percentageChange: null,
      currentDataStatus: 'unavailable',
      comparisonDataStatus: 'complete',
    });
    expect(result.metrics.averageUvsPerTeacher.comparison).toEqual({
      current: null,
      comparison: 4,
      absoluteChange: null,
      percentageChange: null,
      currentDataStatus: 'unavailable',
      comparisonDataStatus: 'complete',
    });
  });

  it('rejects using the same current and comparison period', async () => {
    await expect(
      service.getSummary('user-1', {
        periodId: 'period-1',
        comparisonPeriodId: 'period-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(scopeService.getDomainScope).not.toHaveBeenCalled();
  });

  it('rejects an empty domain scope', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
      branches: [],
    });

    await expect(
      service.getSummary('user-1', { periodId: 'period-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a coordinator teacher without assignments in allowed centers', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'academic-load',
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
        teacherId: 'foreign-teacher',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('paginates after stable allowlisted sorting', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('s1', 'course-1', 4, 'teacher-2', 'Zoe'),
      section('s2', 'course-2', 3, 'teacher-1', 'Ana'),
      section('s3', 'course-3', 2, 'teacher-1', 'Ana'),
    ]);

    const result = await service.getDetails('user-1', {
      metric: 'teacher_load',
      periodId: 'period-1',
      page: '2',
      size: '1',
      sort: 'name:asc',
    });

    expect(result.rows).toEqual([
      {
        teacherId: 'teacher-2',
        name: 'Zoe',
        code: 'C-teacher-2',
        sectionCount: 1,
        distinctCourseCount: 1,
        assignedUvs: 4,
      },
    ]);
    expect(result.meta).toEqual({ page: 2, size: 1, total: 2 });
  });

  it('exports the complete row pipeline in the same requested order', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('s1', 'course-1', 4, 'teacher-2', 'Zoe'),
      section('s2', 'course-2', 3, 'teacher-1', 'Ana'),
      section('s3', 'course-3', 2, 'teacher-1', 'Ana'),
    ]);

    const details = await service.getDetails('user-1', {
      metric: 'teacher_load',
      periodId: 'period-1',
      page: '1',
      size: '1',
      sort: 'assignedUvs:desc',
    });
    const exportRows = await service.getExportRows('user-1', {
      metric: 'teacher_load',
      periodId: 'period-1',
      sort: 'assignedUvs:desc',
    });

    expect(details.rows).toEqual(exportRows.slice(0, 1));
    expect(exportRows.map(({ teacherId }) => teacherId)).toEqual([
      'teacher-1',
      'teacher-2',
    ]);
    expect(exportRows).toHaveLength(2);
  });

  it.each([
    { page: '1.5', size: '25' },
    { page: '1', size: '2.5' },
    { page: '0', size: '25' },
    { page: '1', size: '101' },
  ])('rejects invalid pagination %#', async ({ page, size }) => {
    await expect(
      service.getDetails('user-1', {
        metric: 'teacher_load',
        periodId: 'period-1',
        page,
        size,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
