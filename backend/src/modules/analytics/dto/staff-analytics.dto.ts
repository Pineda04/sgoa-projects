import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID, Matches } from 'class-validator';

export const STAFF_DETAIL_SORTS = [
  'name:asc',
  'name:desc',
  'code:asc',
  'code:desc',
  'contractName:asc',
  'contractName:desc',
  'categoryName:asc',
  'categoryName:desc',
  'shiftName:asc',
  'shiftName:desc',
] as const;

export type StaffDetailSort = (typeof STAFF_DETAIL_SORTS)[number];

export class StaffFiltersDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contractTypeId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  positionId?: string;
}

export class StaffDetailsDto extends StaffFiltersDto {
  @ApiPropertyOptional({ enum: ['staff_current'], default: 'staff_current' })
  @IsIn(['staff_current'])
  metric: 'staff_current';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({ enum: STAFF_DETAIL_SORTS, default: 'name:asc' })
  @IsOptional()
  @IsIn(STAFF_DETAIL_SORTS)
  sort?: StaffDetailSort;
}

export class StaffExportDto extends StaffFiltersDto {
  @ApiProperty({ enum: ['staff_current'] })
  @IsIn(['staff_current'])
  metric: 'staff_current';

  @ApiPropertyOptional({ enum: STAFF_DETAIL_SORTS, default: 'name:asc' })
  @IsOptional()
  @IsIn(STAFF_DETAIL_SORTS)
  sort?: StaffDetailSort;
}
