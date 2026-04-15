import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateConditionDto {
  @ApiProperty({
    description: 'Estado o condición.',
    example: 'Nuevo',
    required: true,
  })
  @IsString({
    message: 'La propiedad <status> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <status> no debe estar vacía.' })
  @Length(3, 50, {
    message: 'La propiedad <status> debe tener entre 3 y 50 caracteres.',
  })
  status: string;
}
