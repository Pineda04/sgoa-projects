import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Validate } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { EDegreeType } from 'src/modules/teachers/enums';
import {
  IsValidGradDegreeConstraint,
  IsValidUserIdConstraint,
} from 'src/modules/teachers/validators';

export class CreateTeacherUndergradDto {
  @ApiProperty({
    description: 'ID del usuario.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <userId> debe ser un UUID válido.',
  })
  @Validate(IsValidUserIdConstraint)
  userId: string;

  @ApiProperty({
    description: 'ID del grado académico de pregrado.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <undergradId> debe ser un UUID válido.',
  })
  @ValidatorConstraintDecorator(
    EDegreeType.UNDERGRAD,
    IsValidGradDegreeConstraint,
  )
  undergradId: string;
}
