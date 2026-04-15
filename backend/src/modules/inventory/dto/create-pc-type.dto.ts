import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePcTypeDto {
  @ApiProperty({
    example: 'Escritorio',
    required: true,
    description: 'Descripción del tipo de PC.',
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <description> no debe estar vacía.' })
  @Length(3, 100, {
    message: 'La propiedad <description> debe tener entre 3 y 100 caracteres.',
  })
  description: string;
}
