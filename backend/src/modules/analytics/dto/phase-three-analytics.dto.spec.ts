import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassroomCapacityDetailsDto, TechnologyDetailsDto } from '.';

const periodId = '11111111-1111-4111-8111-111111111111';

describe('phase three analytics DTOs', () => {
  it('accepts capacity sorts and enforces its metric and page bounds', async () => {
    const valid = plainToInstance(ClassroomCapacityDetailsDto, {
      periodId,
      metric: 'installed_capacity',
      page: '1',
      size: '100',
      sort: 'capacityStatus:desc',
    });
    expect(await validate(valid)).toHaveLength(0);

    const invalid = plainToInstance(ClassroomCapacityDetailsDto, {
      periodId,
      metric: 'equipment_inventory',
      size: '101',
      sort: 'status:asc',
    });
    expect((await validate(invalid)).map(({ property }) => property)).toEqual(
      expect.arrayContaining(['metric', 'size', 'sort']),
    );
  });

  it('accepts technology discriminators and rejects unknown sorts', async () => {
    const valid = plainToInstance(TechnologyDetailsDto, {
      periodId,
      metric: 'equipment_inventory',
      sort: 'conditionLabel:asc',
    });
    expect(await validate(valid)).toHaveLength(0);

    const invalid = plainToInstance(TechnologyDetailsDto, {
      periodId,
      metric: 'unknown',
      sort: 'condition:asc',
    });
    expect((await validate(invalid)).map(({ property }) => property)).toEqual(
      expect.arrayContaining(['metric', 'sort']),
    );
  });
});
