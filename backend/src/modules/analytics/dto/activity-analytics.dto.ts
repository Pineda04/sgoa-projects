import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export const ACTIVITY_DETAIL_SORTS = [
  'activityName:asc',
  'activityName:desc',
  'typeName:asc',
  'typeName:desc',
  'teacherName:asc',
  'teacherName:desc',
  'period:asc',
  'period:desc',
  'progressLevel:asc',
  'progressLevel:desc',
] as const;

export type ActivityDetailSort = (typeof ACTIVITY_DETAIL_SORTS)[number];

export class ActivityFiltersDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({ example: '2026' })
  @IsOptional()
  @Matches(/^\d{4}$/)
  year?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  pac?: string;

  @ApiPropertyOptional({ example: 'Trimestre' })
  @IsOptional()
  @IsString()
  pacModality?: string;

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
  activityTypeId?: string;
}

export class ActivityDetailsDto extends ActivityFiltersDto {
  @ApiPropertyOptional({ enum: ['activities'], default: 'activities' })
  @IsIn(['activities'])
  metric: 'activities';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({
    enum: ACTIVITY_DETAIL_SORTS,
    default: 'activityName:asc',
  })
  @IsOptional()
  @IsIn(ACTIVITY_DETAIL_SORTS)
  sort?: ActivityDetailSort;
}

export class ActivityExportDto extends ActivityFiltersDto {
  @ApiProperty({ enum: ['activities'] })
  @IsIn(['activities'])
  metric: 'activities';

  @ApiPropertyOptional({
    enum: ACTIVITY_DETAIL_SORTS,
    default: 'activityName:asc',
  })
  @IsOptional()
  @IsIn(ACTIVITY_DETAIL_SORTS)
  sort?: ActivityDetailSort;
}
