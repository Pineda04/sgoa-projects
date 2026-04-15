import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({
    description: 'Nombre de la facultad.',
    example: 'Facultad de Ciencias',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  @Length(1, 100, {
    message: 'La propiedad <name> debe tener entre 1 y 100 caracteres.',
  })
  name: string;
}
