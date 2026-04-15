import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMonitorSizeDto {
  @ApiProperty({
    description: 'Descripción del tamaño del monitor.',
    example: '24 pulgadas',
    required: true,
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
