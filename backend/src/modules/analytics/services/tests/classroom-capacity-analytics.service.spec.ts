import { BadRequestException } from '@nestjs/common';
import { ClassroomAnalyticsUniverseService } from '../classroom-analytics-universe.service';
import { ClassroomCapacityAnalyticsService } from '../classroom-capacity-analytics.service';

const classroom = (id: string, maxCapacity: number | null) => ({
  id,
  name: `Aula ${id}`,
  maxCapacity,
  roomType: { id: 'type-1', description: 'Aula' },
  building: {
    id: 'building-1',
    name: 'Edificio 1',
    center: { id: 'center-1', name: 'Centro 1' },
  },
});

describe('ClassroomCapacityAnalyticsService', () => {
  const universe = { load: jest.fn() };
  const service = new ClassroomCapacityAnalyticsService(
    universe as unknown as ClassroomAnalyticsUniverseService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('sums only positive capacity and reports missing and invalid coverage', async () => {
    universe.load.mockResolvedValue({
      classrooms: [
        classroom('known', 40),
        classroom('zero', 0),
        classroom('missing', null),
      ],
    });

    const result = await service.getSummary('user-1', { periodId: 'period-1' });

    expect(result.metrics.installedCapacity).toEqual(
      expect.objectContaining({ value: 40, dataStatus: 'partial' }),
    );
    expect(result.metrics.capacityDataCoverage).toEqual(
      expect.objectContaining({
        numerator: 1,
        denominator: 3,
        dataStatus: 'partial',
      }),
    );
    expect(result.metrics.capacityDataCoverage.value).toBeCloseTo(100 / 3);
    expect(result.metrics.installedCapacity.coverage).toEqual({
      included: 1,
      total: 3,
      excluded: 2,
      reasons: ['missing_classroom_capacity', 'invalid_classroom_capacity'],
    });
  });

  it.each([
    {
      classrooms: [],
      installed: { value: 0, dataStatus: 'complete' },
      coverage: { value: null, dataStatus: 'not_applicable' },
    },
    {
      classrooms: [classroom('missing', null), classroom('invalid', -1)],
      installed: { value: null, dataStatus: 'unavailable' },
      coverage: { value: 0, dataStatus: 'unavailable' },
    },
  ])('handles empty and wholly unknown universes', async (scenario) => {
    universe.load.mockResolvedValue({ classrooms: scenario.classrooms });
    const result = await service.getSummary('user-1', { periodId: 'period-1' });
    expect(result.metrics.installedCapacity).toEqual(
      expect.objectContaining(scenario.installed),
    );
    expect(result.metrics.capacityDataCoverage).toEqual(
      expect.objectContaining(scenario.coverage),
    );
  });

  it('returns every denominator row, stable sorting and validates pagination', async () => {
    universe.load.mockResolvedValue({
      classrooms: [classroom('b', null), classroom('a', 20)],
    });
    const result = await service.getDetails('teacher-user', {
      periodId: 'period-1',
      centerDepartmentId: undefined,
      metric: 'installed_capacity',
      sort: 'maxCapacity:desc',
    });
    expect(universe.load).toHaveBeenCalledWith(
      'teacher-user',
      'period-1',
      undefined,
      'classrooms',
    );
    expect(result.rows.map(({ capacityStatus }) => capacityStatus)).toEqual([
      'known',
      'missing',
    ]);
    expect(result.meta.total).toBe(2);
    await expect(
      service.getDetails('user-1', {
        periodId: 'period-1',
        metric: 'installed_capacity',
        size: '101',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
