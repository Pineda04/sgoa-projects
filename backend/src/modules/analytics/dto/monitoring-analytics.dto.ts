import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsIn, IsOptional, IsUUID, Matches } from 'class-validator';

export const MONITORING_DETAIL_METRICS = [
  'monitoring_checks',
  'digital_blackboard_use',
] as const;
export type MonitoringDetailMetric = (typeof MONITORING_DETAIL_METRICS)[number];

export const MONITORING_DETAIL_SORTS = [
  'checkDate:asc',
  'checkDate:desc',
  'teacherName:asc',
  'teacherName:desc',
  'buildingName:asc',
  'buildingName:desc',
] as const;
export type MonitoringDetailSort = (typeof MONITORING_DETAIL_SORTS)[number];

export class MonitoringFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerId?: string;

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
  buildingId?: string;
}

export class MonitoringDetailsDto extends MonitoringFiltersDto {
  @ApiProperty({ enum: MONITORING_DETAIL_METRICS })
  @IsIn(MONITORING_DETAIL_METRICS)
  metric: MonitoringDetailMetric;

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({ enum: MONITORING_DETAIL_SORTS })
  @IsOptional()
  @IsIn(MONITORING_DETAIL_SORTS)
  sort?: MonitoringDetailSort;
}

export class MonitoringExportDto extends MonitoringFiltersDto {
  @ApiProperty({ enum: MONITORING_DETAIL_METRICS })
  @IsIn(MONITORING_DETAIL_METRICS)
  metric: MonitoringDetailMetric;

  @ApiPropertyOptional({ enum: MONITORING_DETAIL_SORTS })
  @IsOptional()
  @IsIn(MONITORING_DETAIL_SORTS)
  sort?: MonitoringDetailSort;
}
