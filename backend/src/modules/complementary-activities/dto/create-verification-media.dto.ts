import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, Length } from 'class-validator';
import { EComplementaryActivityConfig } from '../enums';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { IsValidComplementaryActivityConfigConstraint } from '../validators';

// TODO: validator constraints
// TODO: 2 ver lo de los archivos
export class CreateVerificationMediaDto {
  @ApiProperty({
    description: 'Descripción del medio de verificación.',
    example: 'Foto de la actividad...',
    type: String,
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'La propiedad <description> no debe estar vacía.',
  })
  @Length(3, 250, {
    message: 'La propiedad <description> debe tener entre 3 y 250 caracteres.',
  })
  description: string;

  @ApiProperty({
    description:
      'ID de la actividad complementaria a la que se le asginará este medio de verificación.',
    example: '38928115-e3b7-4180-83db-255b396bee4a',
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <activityId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <activityId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    EComplementaryActivityConfig.COMPLEMENTARY,
    IsValidComplementaryActivityConfigConstraint,
  )
  activityId: string;
}
