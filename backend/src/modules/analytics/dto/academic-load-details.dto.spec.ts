import { validate } from 'class-validator';
import { AcademicLoadDetailsDto } from './academic-load-details.dto';

describe('AcademicLoadDetailsDto', () => {
  it.each([
    { page: '1.5', size: '25', property: 'page' },
    { page: '1', size: '2.5', property: 'size' },
    { page: '0', size: '25', property: 'page' },
    { page: '1', size: '101', property: 'size' },
  ])('rejects non-positive-integer pagination %#', async (values) => {
    const dto = Object.assign(new AcademicLoadDetailsDto(), {
      metric: 'teacher_load',
      periodId: '10000000-0000-4000-8000-000000000001',
      page: values.page,
      size: values.size,
    });

    const errors = await validate(dto);

    expect(errors.some(({ property }) => property === values.property)).toBe(
      true,
    );
  });
});
