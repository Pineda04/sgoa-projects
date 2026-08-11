import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  ACADEMIC_LOAD_DETAIL_SORTS,
  AcademicLoadDetailSort,
} from './academic-load-details.dto';
import { AnalyticsPeriodScopeFiltersDto } from './analytics-filters.dto';
import {
  ENROLLMENT_DETAIL_SORTS,
  EnrollmentDetailSort,
} from './enrollment-details.dto';

export class AcademicLoadExportDto extends AnalyticsPeriodScopeFiltersDto {
  @ApiProperty({ enum: ['teacher_load'] })
  @IsIn(['teacher_load'])
  metric: 'teacher_load';

  @ApiPropertyOptional({
    enum: ACADEMIC_LOAD_DETAIL_SORTS,
    default: 'name:asc',
  })
  @IsOptional()
  @IsIn(ACADEMIC_LOAD_DETAIL_SORTS)
  sort?: AcademicLoadDetailSort;
}

export class EnrollmentExportDto extends AnalyticsPeriodScopeFiltersDto {
  @ApiProperty({ enum: ['enrollment_capacity'] })
  @IsIn(['enrollment_capacity'])
  metric: 'enrollment_capacity';

  @ApiPropertyOptional({
    enum: ENROLLMENT_DETAIL_SORTS,
    default: 'courseCode:asc',
  })
  @IsOptional()
  @IsIn(ENROLLMENT_DETAIL_SORTS)
  sort?: EnrollmentDetailSort;
}
