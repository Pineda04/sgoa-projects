import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de actividad.',
    example: 'Académica',
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

  @ApiPropertyOptional({
    description: 'Descripción del tipo de actividad, es opcional.',
    example: 'Actividades relacionadas con la docencia y la investigación.',
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @Length(3, 250, {
    message: 'La propiedad <description> debe tener entre 3 y 250 caracteres.',
  })
  @IsOptional()
  description?: string;
}
