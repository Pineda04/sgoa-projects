import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';
import { MonitoringAnalyticsService } from '../monitoring-analytics.service';

describe('MonitoringAnalyticsService', () => {
  const prisma = {
    scheduleComplianceCheck: { findMany: jest.fn() },
  };
  const scope = {
    getDomainScope: jest.fn(),
    intersectRequestedScope: jest.fn(),
  };
  const service = new MonitoringAnalyticsService(
    prisma as never,
    scope as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    const domainScope = {
      domain: 'monitoring',
      branches: [{ type: 'global' }],
    };
    scope.getDomainScope.mockResolvedValue(domainScope);
    scope.intersectRequestedScope.mockReturnValue(domainScope);
  });

  const check = (
    id: string,
    isPresent: boolean,
    digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null,
  ) => ({
    id,
    checkDate: new Date('2026-08-03T06:00:00.000Z'),
    checkTime: '10:00',
    isPresent,
    observation: null,
    digitalBlackboardUseStatus,
    monitor: { id: 'monitor-1', name: 'Monitor' },
    building: {
      id: 'building-1',
      name: 'Edificio 1',
      center: { id: 'center-1', name: 'Centro 1' },
    },
    courseClassroom: {
      id: 'section-1',
      groupCode: 'G1',
      course: { code: 'MAT-1', name: 'Matemática' },
      classroom: {
        id: 'classroom-1',
        name: 'Aula 1',
        building: {
          id: 'building-1',
          name: 'Edificio 1',
          center: { id: 'center-1', name: 'Centro 1' },
        },
      },
      teachingSession: {
        assignmentReport: {
          teacher: { id: 'teacher-1', user: { name: 'Docente' } },
          centerDepartment: {
            id: 'department-1',
            center: { name: 'Centro 1' },
            department: { name: 'Carrera 1' },
          },
          period: {
            id: 'period-1',
            year: 2026,
            pac: 2,
            pac_modality: 'Trimestre',
          },
        },
      },
    },
  });

  it('uses USED + NOT_USED as denominator and exposes UNKNOWN as coverage', async () => {
    prisma.scheduleComplianceCheck.findMany.mockResolvedValue([
      check('check-1', true, DigitalBlackboardUseStatus.USED),
      check('check-2', true, DigitalBlackboardUseStatus.NOT_USED),
      check('check-3', true, DigitalBlackboardUseStatus.UNKNOWN),
      check('check-4', false, null),
    ]);

    const result = await service.getSummary('user-1', {});

    expect(result.metrics.complianceRate.value).toBe(75);
    expect(result.metrics.observedBlackboardUseRate.value).toBe(50);
    expect(result.metrics.observedBlackboardUseRate.denominator).toBe(2);
    expect(result.metrics.blackboardObservationCoverage.value).toBeCloseTo(
      66.666,
      2,
    );
    expect(result.metrics.blackboardObservationCoverage.coverage).toEqual({
      included: 2,
      total: 3,
      excluded: 1,
      reasons: ['unknown_digital_blackboard_use'],
    });
  });

  it('returns null rates when no denominator exists', async () => {
    prisma.scheduleComplianceCheck.findMany.mockResolvedValue([]);

    const result = await service.getSummary('user-1', {});

    expect(result.metrics.complianceRate.value).toBeNull();
    expect(result.metrics.observedBlackboardUseRate.value).toBeNull();
  });
});
