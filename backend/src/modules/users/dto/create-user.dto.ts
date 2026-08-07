import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from 'src/modules/teachers/dto/create-teacher.dto';
import { TeacherRequiredFieldsForRoleConstraint } from '../validators/teacher-required-fields.validator';
import { RolesExistByNameConstraint } from '../validators/roles-exist.validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { MatchConstraint } from '../validators/match.validator';

export class CreateUserDto extends PartialType(CreateTeacherDto) {
  @ApiProperty({
    description: 'Nombre del usuario.',
    example: 'Juan Pérez',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no se debe estar vacía.' })
  @Length(1, 150, {
    message: 'La propiedad <name> debe tener entre 1 y 150 caracteres.',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario.',
    example: 'juan.perez@email.com',
    required: true,
  })
  @IsEmail(
    {},
    {
      message:
        'La propiedad <email> debe tener formato de correo, ejemplo: example@gmail.com',
    },
  )
  @IsString({
    message: 'La propiedad <email> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <email> no se debe estar vacía.' })
  email: string;

  @ApiProperty({
    description: 'Código del usuario.',
    example: 'USR123',
    required: true,
  })
  @IsString({
    message: 'La propiedad <code> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <code> no se debe estar vacía.' })
  code: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario.',
    example: 'Password123!',
    required: true,
  })
  @IsString({
    message: 'La propiedad <password> debe ser una cadena de texto.',
  })
  // @IsNotEmpty({ message: 'La propiedad <password> no se debe estar vacía.' })
  @IsOptional()
  @Length(5, 50, {
    message: 'La propiedad <password> debe ser entre 3 y 50 caracteres.',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña es muy débil.',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Confirmación de la contraseña.',
    example: 'Password123!',
    required: true,
  })
  @IsString({
    message: 'La propiedad <passwordConfirm> debe ser una cadena de texto.',
  })
  // @IsNotEmpty({
  //   message: 'La propiedad <passwordConfirm> no se debe estar vacía.',
  // })
  @IsOptional()
  @Length(5, 50, {
    message: 'La propiedad <passwordConfirm> debe ser entre 3 y 50 caracteres.',
  })
  @ValidatorConstraintDecorator('password', MatchConstraint)
  passwordConfirm: string;

  @ApiProperty({
    description: 'Roles del usuario (nombres de roles existentes).',
    example: ['DOCENTE', 'COORDINADOR_AREA'],
    required: true,
  })
  @IsArray({ message: 'Los roles deben enviarse en un arreglo.' })
  @IsString({ each: true, message: 'Cada rol debe ser una cadena de texto.' })
  @Validate(RolesExistByNameConstraint)
  // @IsOptional()
  @IsNotEmpty({
    message: `El usuario debe contener al menos un rol.`,
  })
  roles: string[];

  @Validate(TeacherRequiredFieldsForRoleConstraint)
  dummyFieldForTeacher: string;
}
