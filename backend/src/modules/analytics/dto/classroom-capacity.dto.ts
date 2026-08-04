import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID, Matches } from 'class-validator';

export const CLASSROOM_CAPACITY_SORTS = [
  'classroomName:asc',
  'classroomName:desc',
  'buildingName:asc',
  'buildingName:desc',
  'maxCapacity:asc',
  'maxCapacity:desc',
  'capacityStatus:asc',
  'capacityStatus:desc',
] as const;

export type ClassroomCapacitySort = (typeof CLASSROOM_CAPACITY_SORTS)[number];

export class ClassroomCapacityFiltersDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;
}

export class ClassroomCapacityDetailsDto extends ClassroomCapacityFiltersDto {
  @ApiProperty({ enum: ['installed_capacity'] })
  @IsIn(['installed_capacity'])
  metric: 'installed_capacity';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({
    enum: CLASSROOM_CAPACITY_SORTS,
    default: 'classroomName:asc',
  })
  @IsOptional()
  @IsIn(CLASSROOM_CAPACITY_SORTS)
  sort?: ClassroomCapacitySort;
}

export class ClassroomCapacityExportDto extends ClassroomCapacityFiltersDto {
  @ApiProperty({ enum: ['installed_capacity'] })
  @IsIn(['installed_capacity'])
  metric: 'installed_capacity';

  @ApiPropertyOptional({
    enum: CLASSROOM_CAPACITY_SORTS,
    default: 'classroomName:asc',
  })
  @IsOptional()
  @IsIn(CLASSROOM_CAPACITY_SORTS)
  sort?: ClassroomCapacitySort;
}
