import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAudioEquipmentDto {
  @ApiProperty({
    description: 'Descripción del equipo de audio.',
    example: 'Parlantes Bluetooth JBL',
    required: true,
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <description> no debe estar vacía.' })
  @Length(1, 100, {
    message: 'La propiedad <description> debe tener entre 1 y 100 caracteres.',
  })
  description: string;
}
