import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateTeacherDto } from 'src/modules/teachers/dto/update-teacher.dto';
import { IntersectionType } from '@nestjs/swagger';

export class UpdateUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  PartialType(UpdateTeacherDto),
) {
  @IsBoolean({
    message: 'La propiedad <activeStatus> debe ser un booleano <true/false>.',
  })
  @IsOptional()
  activeStatus: boolean;

  // @IsOptional()
  // @ValidateNested()
  // @Type(() => UpdateTeacherDto)
  // teacher?: UpdateTeacherDto;
}
