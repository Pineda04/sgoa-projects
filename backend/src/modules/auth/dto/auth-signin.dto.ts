import { IsEmail, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthSigninDto {
  @ApiPropertyOptional({
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
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    description: 'Código de verificación enviado al usuario (opcional).',
    example: '123456',
  })
  @IsString({ message: 'El código debe ser una cadena de caracteres.' })
  @IsOptional()
  code: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Este campo es obligatorio.',
    example: 'MiContraseñaSegura123',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de caracteres.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  password: string;
}
