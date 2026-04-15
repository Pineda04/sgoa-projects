import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherCategoryDto } from './create-teacher-category.dto';

export class UpdateTeacherCategoryDto extends PartialType(CreateTeacherCategoryDto) {}
