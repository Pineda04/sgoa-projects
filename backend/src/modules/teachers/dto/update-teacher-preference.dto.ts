import { OmitType } from '@nestjs/mapped-types';
import { CreateTeacherPreferenceDto } from './create-teacher-preference.dto';

export class UpdateTeacherPreferenceDto extends OmitType(
  CreateTeacherPreferenceDto,
  ['teacherId', 'preferredClasses'],
) {}
