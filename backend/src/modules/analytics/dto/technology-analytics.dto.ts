import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID, Matches } from 'class-validator';

export const TECHNOLOGY_DETAIL_METRICS = [
  'equipped_classrooms',
  'equipped_classroom_enrollment',
  'equipment_inventory',
] as const;
export type TechnologyDetailMetric = (typeof TECHNOLOGY_DETAIL_METRICS)[number];

export const TECHNOLOGY_DETAIL_SORTS = [
  'classroomName:asc',
  'classroomName:desc',
  'buildingName:asc',
  'buildingName:desc',
  'digitalBlackboardCount:asc',
  'digitalBlackboardCount:desc',
  'equipped:asc',
  'equipped:desc',
  'courseCode:asc',
  'courseCode:desc',
  'teacherName:asc',
  'teacherName:desc',
  'studentCount:asc',
  'studentCount:desc',
  'equipmentType:asc',
  'equipmentType:desc',
  'conditionLabel:asc',
  'conditionLabel:desc',
] as const;
export type TechnologyDetailSort = (typeof TECHNOLOGY_DETAIL_SORTS)[number];

export class TechnologyFiltersDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;
}

export class TechnologyDetailsDto extends TechnologyFiltersDto {
  @ApiProperty({ enum: TECHNOLOGY_DETAIL_METRICS })
  @IsIn(TECHNOLOGY_DETAIL_METRICS)
  metric: TechnologyDetailMetric;

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({ enum: TECHNOLOGY_DETAIL_SORTS })
  @IsOptional()
  @IsIn(TECHNOLOGY_DETAIL_SORTS)
  sort?: TechnologyDetailSort;
}

export class TechnologyExportDto extends TechnologyFiltersDto {
  @ApiProperty({ enum: TECHNOLOGY_DETAIL_METRICS })
  @IsIn(TECHNOLOGY_DETAIL_METRICS)
  metric: TechnologyDetailMetric;

  @ApiPropertyOptional({ enum: TECHNOLOGY_DETAIL_SORTS })
  @IsOptional()
  @IsIn(TECHNOLOGY_DETAIL_SORTS)
  sort?: TechnologyDetailSort;
}
