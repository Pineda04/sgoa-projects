/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsScopeService } from '../analytics-scope.service';
import { ClassroomAvailabilityAnalyticsService } from '../classroom-availability-analytics.service';
import { ClassroomAnalyticsUniverseService } from '../classroom-analytics-universe.service';

const filters = {
  periodId: 'period-1',
  dayOfWeek: 'Lu' as const,
  startTime: '08:00',
  endTime: '10:00',
};

const room = (id: string, name = id, type = 'Aula') => ({
  id,
  name,
  roomType: { description: type },
  building: {
    id: `building-${id}`,
    name: `Edificio ${name}`,
    center: { id: `center-${id}`, name: `Centro ${name}` },
  },
});

const occupancy = (
  id: string,
  classroomId: string,
  options: Partial<{
    days: string;
    section: string;
    teacherId: string;
    centerDepartmentId: string;
  }> = {},
) => ({
  id,
  classroomId,
  days: options.days ?? 'Lu',
  section: options.section ?? '08:30 - 09:30',
  groupCode: 'G1',
  course: { code: `CODE-${id}`, name: `Curso ${id}` },
  teachingSession: {
    assignmentReport: {
      teacherId: options.teacherId ?? 'teacher-other',
      centerDepartmentId: options.centerDepartmentId ?? 'cd-other',
      teacher: { user: { name: `Docente ${id}` } },
    },
  },
});

describe('ClassroomAvailabilityAnalyticsService', () => {
  let service: ClassroomAvailabilityAnalyticsService;
  const prisma = {
    academicPeriod: { findUnique: jest.fn() },
    centerDepartment: { findMany: jest.fn() },
    classroom: { findMany: jest.fn() },
    courseClassroom: { findMany: jest.fn() },
  };
  const scopeService = {
    getDomainScope: jest.fn(),
    intersectRequestedScope: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.academicPeriod.findUnique.mockResolvedValue({ id: 'period-1' });
    prisma.centerDepartment.findMany.mockResolvedValue([]);
    prisma.classroom.findMany.mockResolvedValue([]);
    prisma.courseClassroom.findMany.mockResolvedValue([]);
    scopeService.getDomainScope.mockResolvedValue({
      domain: 'classrooms',
      branches: [{ type: 'global' }],
    });
    scopeService.intersectRequestedScope.mockImplementation((scope) => scope);

    const module = await Test.createTestingModule({
      providers: [
        ClassroomAvailabilityAnalyticsService,
        ClassroomAnalyticsUniverseService,
        { provide: PrismaService, useValue: prisma },
        { provide: AnalyticsScopeService, useValue: scopeService },
      ],
    }).compile();
    service = module.get(ClassroomAvailabilityAnalyticsService);
  });

  it('builds coordinator room scope with center AND department and loads occupancy without scope filters', async () => {
    const scope = {
      domain: 'classrooms' as const,
      branches: [
        { type: 'centerDepartments' as const, centerDepartmentIds: ['cd-1'] },
      ],
    };
    scopeService.intersectRequestedScope.mockReturnValue(scope);
    prisma.centerDepartment.findMany.mockResolvedValue([
      { id: 'cd-1', centerId: 'center-1', departmentId: 'department-1' },
    ]);
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);

    await service.getSummary('user-1', filters);

    expect(prisma.classroom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          activeStatus: true,
          OR: [
            {
              building: { centerId: 'center-1' },
              classroomDepartments: {
                some: { departmentId: 'department-1' },
              },
            },
          ],
        },
      }),
    );
    const occupancyWhere =
      prisma.courseClassroom.findMany.mock.calls[0][0].where;
    expect(occupancyWhere).toEqual({
      classroomId: { in: ['room-1'] },
      modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
      teachingSession: { assignmentReport: { periodId: 'period-1' } },
    });
    expect(JSON.stringify(occupancyWhere)).not.toMatch(
      /teacherId|centerDepartmentId/,
    );
  });

  it('limits a teacher catalog to own period assignments and excludes normalized virtual rooms', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'classrooms',
      branches: [{ type: 'teacher', teacherId: 'teacher-own' }],
    });
    prisma.classroom.findMany.mockResolvedValue([
      room('physical'),
      room('virtual', 'Virtual', '  ESPACIO VIRTUAL  '),
    ]);

    const result = await service.getDetails('user-1', {
      ...filters,
      metric: 'classroom_availability',
    });

    expect(prisma.classroom.findMany.mock.calls[0][0].where.OR).toEqual([
      {
        courseClassrooms: {
          some: {
            modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
            teachingSession: {
              assignmentReport: {
                periodId: 'period-1',
                teacherId: 'teacher-own',
              },
            },
          },
        },
      },
    ]);
    expect(result.rows.map(({ classroomId }) => classroomId)).toEqual([
      'physical',
    ]);
    expect(
      prisma.courseClassroom.findMany.mock.calls[0][0].where.classroomId,
    ).toEqual({ in: ['physical'] });
  });

  it('includes out-of-scope occupancy but redacts it while preserving full own and union-branch conflicts', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'classrooms',
      branches: [
        { type: 'teacher', teacherId: 'teacher-own' },
        { type: 'centerDepartments', centerDepartmentIds: ['cd-own'] },
      ],
    });
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('own-teacher', 'room-1', { teacherId: 'teacher-own' }),
      occupancy('own-center', 'room-1', { centerDepartmentId: 'cd-own' }),
      occupancy('outside', 'room-1'),
    ]);

    const result = await service.getDetails('user-1', {
      ...filters,
      metric: 'classroom_availability',
    });
    const [row] = result.rows;

    expect(row.conflicts.map(({ visibility }) => visibility)).toEqual([
      'full',
      'full',
      'restricted',
    ]);
    expect(row.conflicts[2]).toEqual({
      visibility: 'restricted',
      startTime: '08:30',
      endTime: '09:30',
    });
    expect(JSON.stringify(row.conflicts[2])).not.toMatch(
      /course|teacher|group|id/i,
    );
  });

  it('always exposes global conflicts in full', async () => {
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('outside', 'room-1'),
    ]);
    const result = await service.getDetails('admin', {
      ...filters,
      metric: 'classroom_availability',
    });
    expect(result.rows[0].conflicts[0]).toEqual(
      expect.objectContaining({
        visibility: 'full',
        courseCode: 'CODE-outside',
        teacherName: 'Docente outside',
      }),
    );
  });

  it('redacts out-of-scope schedule issues and deduplicates by visibility plus reason', async () => {
    scopeService.intersectRequestedScope.mockReturnValue({
      domain: 'classrooms',
      branches: [{ type: 'teacher', teacherId: 'teacher-own' }],
    });
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('own-bad', 'room-1', {
        teacherId: 'teacher-own',
        section: 'private raw own',
      }),
      occupancy('outside-bad-1', 'room-1', {
        section: 'secret outside one',
      }),
      occupancy('outside-bad-2', 'room-1', {
        section: 'secret outside two',
      }),
    ]);

    const result = await service.getDetails('teacher', {
      ...filters,
      metric: 'classroom_availability',
    });

    expect(result.rows[0].scheduleIssues).toEqual([
      {
        visibility: 'full',
        reason: 'invalid_schedule_section',
        rawDays: 'Lu',
        rawSection: 'private raw own',
      },
      {
        visibility: 'restricted',
        reason: 'invalid_schedule_section',
      },
    ]);
    expect(Object.keys(result.rows[0].scheduleIssues[1])).toEqual([
      'visibility',
      'reason',
    ]);
  });

  it('intersects an explicit center for a multi-role user and redacts the removed teacher branch', async () => {
    const domainScope = {
      domain: 'classrooms' as const,
      branches: [
        { type: 'teacher' as const, teacherId: 'teacher-own' },
        {
          type: 'centerDepartments' as const,
          centerDepartmentIds: ['cd-selected', 'cd-other'],
        },
      ],
    };
    const effectiveScope = {
      domain: 'classrooms' as const,
      branches: [
        {
          type: 'centerDepartments' as const,
          centerDepartmentIds: ['cd-selected'],
        },
      ],
    };
    scopeService.getDomainScope.mockResolvedValue(domainScope);
    scopeService.intersectRequestedScope.mockReturnValue(effectiveScope);
    prisma.centerDepartment.findMany.mockResolvedValue([
      {
        id: 'cd-selected',
        centerId: 'center-1',
        departmentId: 'department-1',
      },
    ]);
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('teacher-branch', 'room-1', {
        teacherId: 'teacher-own',
        centerDepartmentId: 'cd-other',
      }),
      occupancy('center-branch', 'room-1', {
        centerDepartmentId: 'cd-selected',
      }),
    ]);

    const result = await service.getDetails('multi-role', {
      ...filters,
      centerDepartmentId: 'cd-selected',
      metric: 'classroom_availability',
    });

    expect(scopeService.intersectRequestedScope).toHaveBeenCalledWith(
      domainScope,
      { centerDepartmentIds: ['cd-selected'] },
    );
    expect(
      result.rows[0].conflicts.map(({ visibility }) => visibility),
    ).toEqual(['restricted', 'full']);
  });

  it('uses open boundaries, detects partial overlap, and ignores bad sections on other valid days', async () => {
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('contiguous-before', 'room-1', { section: '07:00 - 08:00' }),
      occupancy('contiguous-after', 'room-1', { section: '10:00 - 11:00' }),
      occupancy('partial', 'room-1', { section: '09:30 - 10:30' }),
      occupancy('other-day-bad', 'room-1', {
        days: 'Ma',
        section: 'bad',
      }),
    ]);

    const result = await service.getDetails('admin', {
      ...filters,
      metric: 'classroom_availability',
    });
    expect(result.rows[0]).toEqual(
      expect.objectContaining({
        status: 'occupied',
        dataStatus: 'complete',
        conflictCount: 1,
        scheduleIssues: [],
      }),
    );
  });

  it('gives valid overlap precedence over schedule issues and deduplicates issue reasons', async () => {
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('conflict', 'room-1'),
      occupancy('bad-1', 'room-1', { days: '??', section: 'bad' }),
      occupancy('bad-2', 'room-1', { days: '??', section: 'bad again' }),
    ]);
    const result = await service.getSummary('admin', filters);

    expect(result.metrics).toEqual(
      expect.objectContaining({
        eligibleClassrooms: expect.objectContaining({ value: 1 }),
        occupiedClassrooms: expect.objectContaining({
          value: 1,
          dataStatus: 'partial',
          coverage: {
            included: 1,
            total: 1,
            excluded: 0,
            reasons: ['invalid_schedule_days', 'invalid_schedule_section'],
          },
        }),
        availableClassrooms: expect.objectContaining({ value: 0 }),
        indeterminateClassrooms: expect.objectContaining({ value: 0 }),
        occupancyRate: expect.objectContaining({
          value: 100,
          dataStatus: 'partial',
          numerator: 1,
          denominator: 1,
          coverage: {
            included: 1,
            total: 1,
            excluded: 0,
            reasons: ['invalid_schedule_days', 'invalid_schedule_section'],
          },
        }),
      }),
    );
  });

  it('reconciles indeterminate metrics and makes rate unavailable when nothing is classified', async () => {
    prisma.classroom.findMany.mockResolvedValue([room('room-1')]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('bad', 'room-1', { days: 'Lu', section: 'bad' }),
    ]);
    const result = await service.getSummary('admin', filters);

    expect(result.metrics.occupiedClassrooms.value).toBe(0);
    expect(result.metrics.availableClassrooms.coverage).toEqual({
      included: 0,
      total: 1,
      excluded: 1,
      reasons: ['invalid_schedule_section'],
    });
    expect(result.metrics.indeterminateClassrooms).toEqual(
      expect.objectContaining({ value: 1, dataStatus: 'complete' }),
    );
    expect(result.metrics.occupancyRate).toEqual(
      expect.objectContaining({
        value: null,
        dataStatus: 'unavailable',
        numerator: 0,
        denominator: 1,
      }),
    );
  });

  it('adds coverage to a partial rate with classified and indeterminate rooms', async () => {
    prisma.classroom.findMany.mockResolvedValue([
      room('occupied'),
      room('indeterminate'),
    ]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      occupancy('conflict', 'occupied'),
      occupancy('bad', 'indeterminate', { section: 'bad' }),
    ]);

    const result = await service.getSummary('admin', filters);

    expect(result.metrics.occupancyRate).toEqual(
      expect.objectContaining({
        value: null,
        dataStatus: 'partial',
        numerator: 1,
        denominator: 2,
        coverage: {
          included: 1,
          total: 2,
          excluded: 1,
          reasons: ['invalid_schedule_section'],
        },
      }),
    );
  });

  it('returns not-applicable rate without eligible rooms and paginates sorted details', async () => {
    const empty = await service.getSummary('admin', filters);
    expect(empty.metrics.occupancyRate).toEqual(
      expect.objectContaining({
        value: null,
        dataStatus: 'not_applicable',
        denominator: 0,
      }),
    );

    prisma.classroom.findMany.mockResolvedValue([
      room('b', 'Beta'),
      room('a', 'Alfa'),
    ]);
    const details = await service.getDetails('admin', {
      ...filters,
      metric: 'classroom_availability',
      page: '2',
      size: '1',
      sort: 'classroomName:asc',
    });
    expect(details.rows.map(({ classroomName }) => classroomName)).toEqual([
      'Beta',
    ]);
    expect(details.meta).toEqual({ page: 2, size: 1, total: 2 });
  });

  it('rejects an inverted range in the service', async () => {
    await expect(
      service.getSummary('admin', {
        ...filters,
        startTime: '10:00',
        endTime: '10:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
