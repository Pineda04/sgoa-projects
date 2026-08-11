import { validate } from 'class-validator';
import {
  AcademicLoadExportDto,
  EnrollmentExportDto,
} from './analytics-export.dto';
import {
  ActivityExportDto,
  ClassroomAvailabilityExportDto,
  ClassroomCapacityExportDto,
  StaffExportDto,
  TechnologyExportDto,
} from '.';

describe('Analytics export DTOs', () => {
  it.each([
    [AcademicLoadExportDto, 'teacher_load', 'assignedUvs:desc'],
    [EnrollmentExportDto, 'enrollment_capacity', 'occupancyRate:asc'],
  ] as const)(
    'accepts period, scope, and domain sort for %p',
    async (Dto, metric, sort) => {
      const dto = Object.assign(new Dto(), {
        periodId: '10000000-0000-4000-8000-000000000001',
        centerDepartmentId: '10000000-0000-4000-8000-000000000002',
        teacherId: '10000000-0000-4000-8000-000000000003',
        metric,
        sort,
      });

      await expect(validate(dto)).resolves.toEqual([]);
      expect('page' in dto).toBe(false);
      expect('size' in dto).toBe(false);
      expect(dto.metric).toBe(metric);
      expect('comparisonPeriodId' in dto).toBe(false);
    },
  );

  it.each([
    [
      AcademicLoadExportDto,
      { periodId: '10000000-0000-4000-8000-000000000001' },
    ],
    [EnrollmentExportDto, { periodId: '10000000-0000-4000-8000-000000000001' }],
    [
      ClassroomAvailabilityExportDto,
      {
        periodId: '10000000-0000-4000-8000-000000000001',
        dayOfWeek: 'Lu',
        startTime: '08:00',
        endTime: '09:00',
      },
    ],
    [
      ClassroomCapacityExportDto,
      { periodId: '10000000-0000-4000-8000-000000000001' },
    ],
    [TechnologyExportDto, { periodId: '10000000-0000-4000-8000-000000000001' }],
    [StaffExportDto, {}],
    [ActivityExportDto, {}],
  ] as const)(
    'requires the export metric discriminator for %p',
    async (Dto, values) => {
      const errors = await validate(Object.assign(new Dto(), values));
      expect(errors.map(({ property }) => property)).toContain('metric');
    },
  );

  it('rejects a detail sort from the other domain', async () => {
    const dto = Object.assign(new EnrollmentExportDto(), {
      periodId: '10000000-0000-4000-8000-000000000001',
      sort: 'assignedUvs:desc',
    });

    const errors = await validate(dto);
    expect(errors.map(({ property }) => property)).toContain('sort');
  });
});
