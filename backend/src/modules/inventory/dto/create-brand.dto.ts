import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Nombre de la marca.',
    example: 'Samsung',
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
}
