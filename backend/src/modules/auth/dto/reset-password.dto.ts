import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { MatchConstraint } from 'src/modules/users/validators/match.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'Token de restablecimiento de contraseña enviado al correo del usuario.',
    example: 'd8f7a123-456b-789c-def0-123456abcdef',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario.',
    example: 'MiContraseñaSegura123!',
    minLength: 5,
    maxLength: 50,
  })
  @IsString({
    message: 'La propiedad <password> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <password> no se debe estar vacía.' })
  @Length(5, 50, {
    message: 'La propiedad <password> debe ser entre 5 y 50 caracteres.',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña es muy débil.',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña.',
    example: 'MiContraseñaSegura123!',
    minLength: 5,
    maxLength: 50,
  })
  @IsString({
    message: 'La propiedad <passwordConfirm> debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'La propiedad <passwordConfirm> no se debe estar vacía.',
  })
  @Length(5, 50, {
    message: 'La propiedad <passwordConfirm> debe ser entre 5 y 50 caracteres.',
  })
  @ValidatorConstraintDecorator('password', MatchConstraint)
  passwordConfirm: string;
}
