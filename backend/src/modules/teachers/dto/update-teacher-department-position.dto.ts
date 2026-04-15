import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDepartmentPositionDto } from './create-teacher-department-position.dto';

export class UpdateTeacherDepartmentPositionDto extends PartialType(
  CreateTeacherDepartmentPositionDto,
) {}
