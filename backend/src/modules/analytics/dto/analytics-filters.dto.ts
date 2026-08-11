import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AnalyticsFilterOptionsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  buildingId?: string;
}

export class AnalyticsPeriodScopeFiltersDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}

export class AcademicLoadFiltersDto extends AnalyticsPeriodScopeFiltersDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  comparisonPeriodId?: string;
}

export class EnrollmentFiltersDto extends AcademicLoadFiltersDto {}
