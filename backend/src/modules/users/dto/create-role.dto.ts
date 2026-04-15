import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol.',
    example: 'Administrador',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @Length(3, 50, {
    message: 'La propiedad <name> debe ser entre 3 y 50 caracteres.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no se debe estar vacía.' })
  name: string;

  @ApiProperty({
    description: 'Descripción del rol.',
    example: 'Rol con permisos administrativos',
    required: false,
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @Length(3, 50, {
    message: 'La propiedad <description> debe ser entre 3 y 50 caracteres.',
  })
  @IsOptional()
  description: string | null;
}
