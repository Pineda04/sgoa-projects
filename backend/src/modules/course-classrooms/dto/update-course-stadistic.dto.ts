import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseStadisticDto } from './create-course-stadistic.dto';

export class UpdateCourseStadisticDto extends PartialType(
  CreateCourseStadisticDto,
) {}
