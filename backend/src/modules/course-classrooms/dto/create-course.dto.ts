import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsInt,
  IsBoolean,
  IsUUID,
  Validate,
} from 'class-validator';
import { normalizeText } from 'src/common/utils';
import { Transform } from 'class-transformer';
import { ExistsCodeCourseValidator } from '../validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidDepartmentIdConstraint } from 'src/modules/centers/validators';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Nombre del curso.',
    example: 'Matemáticas Avanzadas',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  @Length(3, 100, {
    message: 'La propiedad <name> debe tener entre 3 y 100 caracteres.',
  })
  name: string;

  @ApiProperty({
    description:
      'Código del curso, solo letras y números sin guiones ni puntos.',
    example: 'MAT123',
    required: true,
  })
  @IsString({
    message: 'La propiedad <code> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <code> no debe estar vacía.' })
  @Length(3, 7, {
    message: 'La propiedad <code> debe tener entre 3 y 7 texto.',
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message:
      'La propiedad <code> no puede contener guiones, puntos ni guiones bajos, solo letras y números.',
  })
  @Transform(({ value }) => typeof value === 'string' && normalizeText(value))
  @Validate(ExistsCodeCourseValidator)
  code: string;

  @ApiProperty({
    description: 'UVs del curso (unidades valorativas).',
    example: 5,
    required: true,
  })
  @IsInt({ message: 'La propiedad <uvs> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <uvs> no debe estar vacía.' })
  uvs: number;

  @ApiProperty({
    description: 'Estado activo del curso.',
    example: true,
    required: true,
  })
  @IsBoolean({
    message: 'La propiedad <activeStatus> debe ser un valor booleano.',
  })
  @IsNotEmpty({ message: 'La propiedad <activeStatus> no debe estar vacía.' })
  activeStatus: boolean;

  @ApiProperty({
    description: 'UUID del departamento al que pertenece el curso.',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <departmentId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <departmentId> no debe estar vacía.' })
  @Validate(IsValidDepartmentIdConstraint)
  departmentId: string;
}
