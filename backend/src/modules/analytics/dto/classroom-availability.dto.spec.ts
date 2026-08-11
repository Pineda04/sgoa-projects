import { validate } from 'class-validator';
import {
  ClassroomAvailabilityDetailsDto,
  ClassroomAvailabilityExportDto,
  ClassroomAvailabilityFiltersDto,
} from './classroom-availability.dto';

const valid = {
  periodId: '10000000-0000-4000-8000-000000000001',
  centerDepartmentId: '10000000-0000-4000-8000-000000000002',
  dayOfWeek: 'Lu',
  startTime: '08:00',
  endTime: '10:00',
};

describe('Classroom availability DTOs', () => {
  it('accepts only canonical day and time filters', async () => {
    await expect(
      validate(Object.assign(new ClassroomAvailabilityFiltersDto(), valid)),
    ).resolves.toEqual([]);

    const invalid = Object.assign(new ClassroomAvailabilityFiltersDto(), {
      ...valid,
      dayOfWeek: 'Lunes',
      startTime: '8:00',
    });
    expect((await validate(invalid)).map(({ property }) => property)).toEqual(
      expect.arrayContaining(['dayOfWeek', 'startTime']),
    );
  });

  it('validates detail metric, pagination and supported sorts', async () => {
    const dto = Object.assign(new ClassroomAvailabilityDetailsDto(), {
      ...valid,
      metric: 'classroom_availability',
      page: '2',
      size: '100',
      sort: 'buildingName:desc',
    });
    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('requires the export metric and keeps pagination fields out', async () => {
    const dto = Object.assign(new ClassroomAvailabilityExportDto(), {
      ...valid,
      metric: 'classroom_availability',
      sort: 'status:asc',
    });
    await expect(validate(dto)).resolves.toEqual([]);
    expect('page' in dto).toBe(false);
    expect('size' in dto).toBe(false);
    expect(dto.metric).toBe('classroom_availability');
  });
});
