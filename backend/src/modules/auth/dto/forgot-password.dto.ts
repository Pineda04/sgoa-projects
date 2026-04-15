import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
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
  email: string;
}
