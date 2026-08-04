import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID, Matches } from 'class-validator';
import { COURSE_CLASSROOM_DAY_CODES } from 'src/common/utils/course-classroom-schedule.util';

export const CLASSROOM_AVAILABILITY_SORTS = [
  'status:asc',
  'status:desc',
  'classroomName:asc',
  'classroomName:desc',
  'buildingName:asc',
  'buildingName:desc',
] as const;

export type ClassroomAvailabilitySort =
  (typeof CLASSROOM_AVAILABILITY_SORTS)[number];

const CANONICAL_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export class ClassroomAvailabilityFiltersDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;

  @ApiProperty({ enum: COURSE_CLASSROOM_DAY_CODES })
  @IsIn(COURSE_CLASSROOM_DAY_CODES)
  dayOfWeek: (typeof COURSE_CLASSROOM_DAY_CODES)[number];

  @ApiProperty({ example: '08:00' })
  @Matches(CANONICAL_TIME)
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @Matches(CANONICAL_TIME)
  endTime: string;
}

export class ClassroomAvailabilityDetailsDto extends ClassroomAvailabilityFiltersDto {
  @ApiProperty({ enum: ['classroom_availability'] })
  @IsIn(['classroom_availability'])
  metric: 'classroom_availability';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  page?: string;

  @ApiPropertyOptional({ default: '25', maximum: 100 })
  @IsOptional()
  @Matches(/^(?:[1-9]|[1-9]\d|100)$/)
  size?: string;

  @ApiPropertyOptional({
    enum: CLASSROOM_AVAILABILITY_SORTS,
    default: 'classroomName:asc',
  })
  @IsOptional()
  @IsIn(CLASSROOM_AVAILABILITY_SORTS)
  sort?: ClassroomAvailabilitySort;
}

export class ClassroomAvailabilityExportDto extends ClassroomAvailabilityFiltersDto {
  @ApiProperty({ enum: ['classroom_availability'] })
  @IsIn(['classroom_availability'])
  metric: 'classroom_availability';

  @ApiPropertyOptional({
    enum: CLASSROOM_AVAILABILITY_SORTS,
    default: 'classroomName:asc',
  })
  @IsOptional()
  @IsIn(CLASSROOM_AVAILABILITY_SORTS)
  sort?: ClassroomAvailabilitySort;
}
