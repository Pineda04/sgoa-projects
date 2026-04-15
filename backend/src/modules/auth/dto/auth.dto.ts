import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    description:
      'Correo electrónico del usuario. Debe tener un formato válido.',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido.' },
  )
  @IsString({
    message: 'El correo electrónico debe ser una cadena de caracteres.',
  })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Este campo es obligatorio.',
    example: 'MiContraseñaSegura123',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de caracteres.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  password: string;
}
