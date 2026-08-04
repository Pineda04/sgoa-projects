import { validate } from 'class-validator';
import { ActivityDetailsDto, StaffDetailsDto } from '.';

describe('Phase 4 analytics DTOs', () => {
  it('accepts bounded pagination and documented staff sorts', async () => {
    const dto = Object.assign(new StaffDetailsDto(), {
      metric: 'staff_current',
      page: '1',
      size: '100',
      sort: 'contractName:desc',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects oversized pages and unknown activity sorts', async () => {
    const dto = Object.assign(new ActivityDetailsDto(), {
      metric: 'activities',
      periodId: 'd0d9f9f8-6ad0-44a7-a77f-f618bd2dab23',
      size: '101',
      sort: 'fileNumber:asc',
    });
    const errors = await validate(dto);
    expect(errors.map(({ property }) => property).sort()).toEqual([
      'size',
      'sort',
    ]);
  });
});
