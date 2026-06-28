import {
  IsString,
  IsNotEmpty,
  Length,
  IsUUID,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ECenterConfig } from '../enums';
import { IsValidCenterConfigConstraint } from '../validators';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar un departamento.
 * La validación de unicidad del nombre se realiza en el service,
 * excluyendo el registro que se está editando.
 */
export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Nombre del departamento.',
    example: 'Departamento de Ingeniería',
  })
  @IsOptional()
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  @Length(1, 100, {
    message: 'La propiedad <name> debe tener entre 1 y 100 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Número de UVs.',
    example: 30,
  })
  @IsOptional()
  @IsInt({ message: 'La propiedad <uvs> debe ser un número.' })
  uvs?: number | null;

  @ApiPropertyOptional({
    description: 'ID de la facultad a la que pertenece el departamento.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <facultyId> debe ser un UUID válido.',
  })
  @ValidatorConstraintDecorator(
    ECenterConfig.FACULTY,
    IsValidCenterConfigConstraint,
  )
  facultyId?: string;
}
