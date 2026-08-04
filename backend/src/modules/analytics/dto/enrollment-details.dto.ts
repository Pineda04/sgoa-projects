import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { AnalyticsPeriodScopeFiltersDto } from './analytics-filters.dto';

export const ENROLLMENT_DETAIL_SORTS = [
  'courseCode:asc',
  'courseCode:desc',
  'teacherName:asc',
  'teacherName:desc',
  'classroomName:asc',
  'classroomName:desc',
  'studentCount:asc',
  'studentCount:desc',
  'occupancyRate:asc',
  'occupancyRate:desc',
] as const;

export type EnrollmentDetailSort = (typeof ENROLLMENT_DETAIL_SORTS)[number];

export class EnrollmentDetailsDto extends AnalyticsPeriodScopeFiltersDto {
  @ApiProperty({ enum: ['enrollment_capacity'] })
  @IsIn(['enrollment_capacity'])
  metric: 'enrollment_capacity';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: '<page> debe ser un entero positivo.' })
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/, {
    message: '<size> debe ser un entero entre 1 y 100.',
  })
  size?: string;

  @ApiPropertyOptional({
    enum: ENROLLMENT_DETAIL_SORTS,
    default: 'courseCode:asc',
  })
  @IsOptional()
  @IsIn(ENROLLMENT_DETAIL_SORTS)
  sort?: EnrollmentDetailSort;
}
