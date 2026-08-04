import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { AcademicLoadFiltersDto } from './analytics-filters.dto';

export const ACADEMIC_LOAD_DETAIL_SORTS = [
  'name:asc',
  'name:desc',
  'code:asc',
  'code:desc',
  'sectionCount:asc',
  'sectionCount:desc',
  'distinctCourseCount:asc',
  'distinctCourseCount:desc',
  'assignedUvs:asc',
  'assignedUvs:desc',
] as const;

export type AcademicLoadDetailSort =
  (typeof ACADEMIC_LOAD_DETAIL_SORTS)[number];

export class AcademicLoadDetailsDto extends AcademicLoadFiltersDto {
  @ApiPropertyOptional({ enum: ['teacher_load'], default: 'teacher_load' })
  @IsIn(['teacher_load'])
  metric: 'teacher_load';

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
    enum: ACADEMIC_LOAD_DETAIL_SORTS,
    default: 'name:asc',
  })
  @IsOptional()
  @IsIn(ACADEMIC_LOAD_DETAIL_SORTS)
  sort?: AcademicLoadDetailSort;
}
