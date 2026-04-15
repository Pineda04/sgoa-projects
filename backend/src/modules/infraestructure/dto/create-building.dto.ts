import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsUUID,
} from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ECenterConfig } from 'src/modules/centers/enums';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';

export class CreateBuildingDto {
  @ApiProperty({
    description: 'Nombre del edificio.',
    example: 'Edificio Central',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @Length(3, 50, {
    message: 'La propiedad <name> debe ser entre 3 y 50 caracteres.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Color representativo del edificio.',
    example: '#FF5733',
  })
  @IsString({
    message: 'La propiedad <color> debe ser una cadena de texto.',
  })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Número o descripción de pisos del edificio.',
    example: '5',
  })
  @IsString({
    message: 'La propiedad <floors> debe ser una cadena de texto.',
  })
  @IsOptional()
  floors?: string;

  @ApiProperty({
    description: 'ID del centro al que pertenece el edificio.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <centerId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <centerId> no debe estar vacía.' })
  // FIXME: se debe arreglar esto
  // @IsValidCenterConfig(ECenterConfig.CENTER)
  @ValidatorConstraintDecorator(
    ECenterConfig.CENTER,
    IsValidCenterConfigConstraint,
  )
  centerId: string;
}
