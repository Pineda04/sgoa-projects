import { PartialType } from '@nestjs/swagger';
import { CreateCourseClassroomDto } from './create-course-classroom.dto';

export class UpdateCourseClassroomDto extends PartialType(
  CreateCourseClassroomDto,
) {}
